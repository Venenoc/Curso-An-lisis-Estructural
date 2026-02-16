import { getUser } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CommunityPageClient from "@/components/community/CommunityPageClient";

export default async function CommunityPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const supabase = await createClient();

  // Get profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, role")
    .eq("user_id", user.id)
    .single();

  if (!profile) redirect("/login");

  // Get posts with author profiles
  const { data: rawPosts } = await supabase
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
  const { data: allLikes } = await supabase
    .from("community_likes")
    .select("id, post_id, user_id")
    .in("post_id", posts.map((p: any) => p.id));

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
    const { data } = await supabase
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
  const { data: allUsers } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, role")
    .order("full_name");

  // Get direct messages involving this user
  const { data: messages } = await supabase
    .from("direct_messages")
    .select("*")
    .or(`sender_id.eq.${profile.id},receiver_id.eq.${profile.id}`)
    .order("created_at", { ascending: true });

  return (
    <CommunityPageClient
      currentUserId={profile.id}
      currentUserRole={profile.role}
      posts={posts || []}
      replies={replies}
      likesMap={likesMap}
      allUsers={allUsers || []}
      messages={messages || []}
    />
  );
}
