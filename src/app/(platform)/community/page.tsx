import { getUser } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { calcularNivel, calcularScore } from "@/lib/community-levels";
import type { UserStats, LeaderboardEntry } from "@/lib/community-levels";
import CommunityPageClient from "@/components/community/CommunityPageClient";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export default async function CommunityPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const supabase = await createClient();

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Get profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, role")
    .eq("user_id", user.id)
    .single();

  if (!profile) redirect("/login");

  // Get posts with author profiles
  const { data: rawPosts } = await supabaseAdmin
    .from("community_posts")
    .select("id, user_id, title, content, image_url, pinned, created_at, profiles(full_name, avatar_url, role)")
    .order("created_at", { ascending: false })
    .limit(50);

  // Normalize profiles from array to object
  const posts = (rawPosts || []).map((p: any) => ({
    ...p,
    profiles: Array.isArray(p.profiles) ? p.profiles[0] : p.profiles,
  }));

  // Get likes for all posts
  const { data: allLikes } = await supabaseAdmin
    .from("community_likes")
    .select("id, post_id, user_id")
    .in("post_id", posts.length > 0 ? posts.map((p: any) => p.id) : ["__none__"]);

  // Build likes map: { postId: { count, likedByMe } }
  const likesMap: Record<string, { count: number; likedByMe: boolean }> = {};
  (allLikes || []).forEach((like: any) => {
    if (!likesMap[like.post_id]) {
      likesMap[like.post_id] = { count: 0, likedByMe: false };
    }
    likesMap[like.post_id].count++;
    if (like.user_id === profile.id) {
      likesMap[like.post_id].likedByMe = true;
    }
  });

  // Get replies with author profiles
  const postIds = posts.map((p: any) => p.id);
  let replies: any[] = [];
  if (postIds.length > 0) {
    const { data } = await supabaseAdmin
      .from("community_replies")
      .select("id, post_id, user_id, content, created_at, profiles(full_name, avatar_url, role)")
      .in("post_id", postIds)
      .order("created_at", { ascending: true });
    replies = (data || []).map((r: any) => ({
      ...r,
      profiles: Array.isArray(r.profiles) ? r.profiles[0] : r.profiles,
    }));
  }

  // Get all users for messaging
  const { data: allUsers } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name, avatar_url, role")
    .order("full_name");

  // Get direct messages involving this user
  const { data: messages } = await supabaseAdmin
    .from("direct_messages")
    .select("*")
    .or(`sender_id.eq.${profile.id},receiver_id.eq.${profile.id}`)
    .order("created_at", { ascending: true });

  // ── Compute user stats for levels ──

  // Count posts per user (all posts, not just last 50)
  const { data: allPostsForStats } = await supabaseAdmin
    .from("community_posts")
    .select("user_id");

  const postCountByUser: Record<string, number> = {};
  (allPostsForStats || []).forEach((p: any) => {
    postCountByUser[p.user_id] = (postCountByUser[p.user_id] || 0) + 1;
  });

  // Count replies per user
  const { data: allRepliesForStats } = await supabaseAdmin
    .from("community_replies")
    .select("user_id");

  const replyCountByUser: Record<string, number> = {};
  (allRepliesForStats || []).forEach((r: any) => {
    replyCountByUser[r.user_id] = (replyCountByUser[r.user_id] || 0) + 1;
  });

  // Count likes received per post author
  const { data: allLikesWithPosts } = await supabaseAdmin
    .from("community_likes")
    .select("post_id, community_posts(user_id)");

  const likesReceivedByUser: Record<string, number> = {};
  (allLikesWithPosts || []).forEach((l: any) => {
    const authorId = l.community_posts?.user_id;
    if (authorId) {
      likesReceivedByUser[authorId] = (likesReceivedByUser[authorId] || 0) + 1;
    }
  });

  // Build userStats map
  const allUserIds = new Set<string>();
  Object.keys(postCountByUser).forEach((id) => allUserIds.add(id));
  Object.keys(replyCountByUser).forEach((id) => allUserIds.add(id));
  Object.keys(likesReceivedByUser).forEach((id) => allUserIds.add(id));
  // Always include current user
  allUserIds.add(profile.id);

  const userStatsMap: Record<string, UserStats> = {};
  allUserIds.forEach((userId) => {
    const p = postCountByUser[userId] || 0;
    const r = replyCountByUser[userId] || 0;
    const l = likesReceivedByUser[userId] || 0;
    userStatsMap[userId] = {
      posts: p,
      replies: r,
      likesReceived: l,
      level: calcularNivel(p, r, l),
      score: calcularScore(p, r, l),
    };
  });

  // Build leaderboard (top 10 by score)
  const usersById = new Map<string, any>();
  (allUsers || []).forEach((u: any) => usersById.set(u.id, u));

  const leaderboard: LeaderboardEntry[] = Array.from(allUserIds)
    .map((userId) => {
      const userProfile = usersById.get(userId);
      return {
        userId,
        fullName: userProfile?.full_name || null,
        avatarUrl: userProfile?.avatar_url || null,
        role: userProfile?.role || "student",
        stats: userStatsMap[userId],
      };
    })
    .filter((e) => e.stats.score > 0)
    .sort((a, b) => b.stats.score - a.stats.score)
    .slice(0, 10);

  // Active members count (users who posted or replied)
  const activeMembersCount = allUserIds.size;

  return (
    <div className="flex min-h-screen flex-col overflow-hidden relative mt-16">
      {/* Fondo fijo */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        backgroundImage: `url(${process.env.NEXT_PUBLIC_CF_R2_PUBLIC_URL}/images/FondoPlataforma/FondoPlatform_com.jpg)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        pointerEvents: 'none',
      }} />
      <ScrollReveal className="relative z-10 flex-1 flex flex-col overflow-hidden" delay={0.1}>
        <CommunityPageClient
          currentUserId={profile.id}
          currentUserRole={profile.role}
          currentUserName={profile.full_name}
          currentUserAvatar={profile.avatar_url}
          posts={posts || []}
          replies={replies}
          likesMap={likesMap}
          allUsers={allUsers || []}
          messages={messages || []}
          userStats={userStatsMap}
          leaderboard={leaderboard}
          activeMembersCount={activeMembersCount}
        />
      </ScrollReveal>
    </div>
  );
}
