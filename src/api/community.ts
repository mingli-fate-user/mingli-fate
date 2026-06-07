// 使用 npoint.io 作为免费云端数据存储
// 所有人都可以读写，实现数据共享

const BIN_ID = 'db85e8f5f0f7451084e0';
const BASE_URL = `https://api.npoint.io/${BIN_ID}`;

export interface Post {
  id: number;
  title: string;
  content: string;
  category: string;
  authorName: string;
  authorAvatar: string | null;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
}

export interface Comment {
  id: number;
  postId: number;
  content: string;
  authorName: string;
  authorAvatar: string | null;
  createdAt: string;
}

interface CommunityData {
  posts: Post[];
  comments: Comment[];
}

// 获取所有社区数据
export async function getCommunityData(): Promise<CommunityData> {
  const resp = await fetch(BASE_URL, { cache: 'no-store' });
  if (!resp.ok) throw new Error('Failed to fetch data');
  const data = await resp.json();
  return {
    posts: data.posts || [],
    comments: data.comments || [],
  };
}

// 保存所有社区数据
async function saveCommunityData(data: CommunityData): Promise<void> {
  const resp = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!resp.ok) throw new Error('Failed to save data');
}

// 获取所有帖子
export async function getPosts(): Promise<Post[]> {
  const data = await getCommunityData();
  return data.posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// 获取单个帖子
export async function getPost(id: number): Promise<Post | null> {
  const data = await getCommunityData();
  return data.posts.find(p => p.id === id) || null;
}

// 获取评论
export async function getComments(postId: number): Promise<Comment[]> {
  const data = await getCommunityData();
  return data.comments
    .filter(c => c.postId === postId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

// 添加帖子
export async function addPost(post: Omit<Post, 'id' | 'createdAt'>): Promise<Post> {
  const data = await getCommunityData();
  const newPost: Post = {
    ...post,
    id: Date.now(),
    createdAt: new Date().toISOString(),
  };
  data.posts.unshift(newPost);
  await saveCommunityData(data);
  return newPost;
}

// 添加评论
export async function addComment(comment: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment> {
  const data = await getCommunityData();
  const newComment: Comment = {
    ...comment,
    id: Date.now(),
    createdAt: new Date().toISOString(),
  };
  data.comments.push(newComment);

  // 更新帖子评论数
  const post = data.posts.find(p => p.id === comment.postId);
  if (post) post.commentCount++;

  await saveCommunityData(data);
  return newComment;
}

// 点赞帖子
export async function likePost(postId: number): Promise<void> {
  const data = await getCommunityData();
  const post = data.posts.find(p => p.id === postId);
  if (post) {
    post.likeCount++;
    await saveCommunityData(data);
  }
}

// 增加浏览量
export async function incrementView(postId: number): Promise<void> {
  const data = await getCommunityData();
  const post = data.posts.find(p => p.id === postId);
  if (post) {
    post.viewCount++;
    await saveCommunityData(data);
  }
}

const CATEGORIES = ['全部', '六爻解卦', '紫微斗数', '面相交流', '江氏小六壬', '梅花易数', '八字命理', '日常闲聊', '求助问答'];

export { CATEGORIES };

// 格式化时间
export function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = (now.getTime() - d.getTime()) / 1000;
  if (diff < 60) return '刚刚';
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}天前`;
  return d.toLocaleDateString('zh-CN');
}
