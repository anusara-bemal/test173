import type {
  User,
  InsertUser,
  Post,
  InsertPost,
  Comment,
  InsertComment,
  UpdateUserProfile,
  Story,
  InsertStory,
  Message,
  InsertMessage,
  Community,
  InsertCommunity,
  FriendRequest,
  InsertFriendRequest,
  Friendship
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

interface DMCAClaim {
  id: number;
  movieId: number;
  claimantEmail: string;
  description: string;
  evidence: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date | null;
  responseMessage?: string;
}

interface InsertDMCAClaim {
  movieId: number;
  claimantEmail: string;
  description: string;
  evidence: string;
}

interface MovieComment {
  id: number;
  movieId: number;
  userId: number;
  content: string;
  likes: number;
  createdAt: Date;
  updatedAt: Date | null;
}

interface InsertMovieComment {
  movieId: number;
  content: string;
}

interface MovieReport {
  id: number;
  movieId: number;
  userId: number;
  reason: string;
  description: string;
  status: 'pending' | 'resolved' | 'rejected';
  createdAt: Date;
  updatedAt: Date | null;
}

interface InsertMovieReport {
  movieId: number;
  reason: string;
  description: string;
}

interface Movie {
  id: number;
  uploaderId: number;
  title: string;
  description: string;
  url: string;
  thumbnailUrl: string;
  trailerUrl?: string;
  type: 'movie' | 'series';
  // For series
  seasonNumber?: number;
  episodeNumber?: number;
  // Metadata
  metadata?: {
    genre?: string[];
    cast?: string[];
    releaseYear?: number;
    language?: string;
    subtitles?: { language: string; url: string; }[];
    contentRating?: string;
    aiTags?: string[];
    copyrightInfo?: {
      owner: string;
      license: string;
    };
  };
  status: string;
  views: number;
  likes: number;
  comments: number;
  createdAt: Date;
  updatedAt: Date | null;
  copyrightStatus: {
    isSafe: boolean;
    confidence: number;
    lastChecked: Date;
  };
}

interface InsertMovie {
  title: string;
  description: string;
  url: string;
  thumbnailUrl: string;
  trailerUrl?: string;
  type: 'movie' | 'series';
  seasonNumber?: number;
  episodeNumber?: number;
  metadata?: {
    genre?: string[];
    cast?: string[];
    releaseYear?: number;
    language?: string;
    subtitles?: { language: string; url: string; }[];
    contentRating?: string;
    aiTags?: string[];
    copyrightInfo?: {
      owner: string;
      license: string;
    };
  };
}

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserProfile(userId: number, profile: UpdateUserProfile): Promise<User>;
  getUserCount(): Promise<number>;
  updateUser(userId: number, updates: Partial<User>): Promise<User>; // Added updateUser method

  // Post operations
  createPost(userId: number, post: InsertPost): Promise<Post>;
  getPost(id: number): Promise<Post | undefined>;
  getUserPosts(userId: number): Promise<Post[]>;
  getFeedPosts(userId: number): Promise<Post[]>;
  deletePost(id: number): Promise<void>;
  likePost(userId: number, postId: number): Promise<void>;
  unlikePost(userId: number, postId: number): Promise<void>;
  sharePost(userId: number, postId: number): Promise<void>;

  // Comment operations
  createComment(userId: number, postId: number, comment: InsertComment): Promise<Comment>;
  getPostComments(postId: number): Promise<Comment[]>;
  getThreadedComments(parentId: number): Promise<Comment[]>;
  deleteComment(id: number): Promise<void>;
  likeComment(userId: number, commentId: number): Promise<void>;
  unlikeComment(userId: number, commentId: number): Promise<void>;

  // Story operations
  createStory(userId: number, story: InsertStory): Promise<Story>;
  getUserStories(userId: number): Promise<Story[]>;
  getFeedStories(userId: number): Promise<Story[]>;
  viewStory(userId: number, storyId: number): Promise<void>;
  deleteStory(id: number): Promise<void>;

  // Message operations
  createConversation(userIds: number[], name?: string): Promise<number>;
  getConversations(userId: number): Promise<any[]>;
  getMessages(conversationId: number, limit?: number): Promise<Message[]>;
  sendMessage(userId: number, conversationId: number, message: InsertMessage): Promise<Message>;
  deleteMessage(messageId: number): Promise<void>;
  editMessage(messageId: number, content: string): Promise<Message>;

  // Community operations
  createCommunity(userId: number, community: InsertCommunity): Promise<Community>;
  getCommunity(id: number): Promise<Community | undefined>;
  joinCommunity(userId: number, communityId: number, role?: string): Promise<void>;
  leaveCommunity(userId: number, communityId: number): Promise<void>;
  getCommunityMembers(communityId: number): Promise<User[]>;
  getCommunityPosts(communityId: number): Promise<Post[]>;

  // Follow operations
  followUser(followerId: number, followingId: number): Promise<void>;
  unfollowUser(followerId: number, followingId: number): Promise<void>;
  getFollowers(userId: number): Promise<User[]>;
  getFollowing(userId: number): Promise<User[]>;

  // Movie operations
  createMovie(uploaderId: number, movie: InsertMovie): Promise<Movie>;
  getMovie(id: number): Promise<Movie | undefined>;
  getMovies(status?: string): Promise<Movie[]>;
  updateMovieStatus(id: number, status: string): Promise<Movie>;
  updateMovieMetadata(id: number, metadata: any): Promise<Movie>;
  deleteMovie(id: number): Promise<void>;
  incrementMovieViews(id: number): Promise<void>;

  // DMCA and Copyright operations
  createDMCAClaim(claim: InsertDMCAClaim): Promise<DMCAClaim>;
  getDMCAClaim(id: number): Promise<DMCAClaim | undefined>;
  updateDMCAClaimStatus(id: number, status: 'approved' | 'rejected', responseMessage?: string): Promise<DMCAClaim>;
  getMovieDMCAClaims(movieId: number): Promise<DMCAClaim[]>;
  getPendingDMCAClaims(): Promise<DMCAClaim[]>;

  // Watchlist operations
  addToWatchlist(userId: number, movieId: number): Promise<void>;
  removeFromWatchlist(userId: number, movieId: number): Promise<void>;
  getWatchlist(userId: number): Promise<Movie[]>;

  // Like operations
  likeMovie(userId: number, movieId: number): Promise<void>;
  unlikeMovie(userId: number, movieId: number): Promise<void>;

  // Comment operations
  addMovieComment(userId: number, comment: InsertMovieComment): Promise<MovieComment>;
  getMovieComments(movieId: number): Promise<MovieComment[]>;
  deleteMovieComment(commentId: number): Promise<void>;
  likeMovieComment(userId: number, commentId: number): Promise<void>;
  unlikeMovieComment(userId: number, commentId: number): Promise<void>;

  // Report operations
  reportMovie(userId: number, report: InsertMovieReport): Promise<MovieReport>;
  getMovieReports(movieId: number): Promise<MovieReport[]>;
  updateReportStatus(reportId: number, status: MovieReport['status']): Promise<void>;

  // Add reaction methods to the interface
  addReaction(userId: number, postId: number, type: string): Promise<void>;
  removeReaction(userId: number, postId: number): Promise<void>;


  // Friend request methods
  createFriendRequest(senderId: number, request: InsertFriendRequest): Promise<FriendRequest>;
  getFriendRequest(id: number): Promise<FriendRequest | undefined>;
  getFriendRequestsByUser(userId: number, type: 'sent' | 'received'): Promise<FriendRequest[]>;
  updateFriendRequestStatus(id: number, status: 'accepted' | 'rejected'): Promise<FriendRequest>;

  // Friendship methods
  getFriendships(userId: number): Promise<User[]>;
  checkFriendship(user1Id: number, user2Id: number): Promise<boolean>;
  removeFriend(user1Id: number, user2Id: number): Promise<void>;
  blockFriend(userId: number, friendId: number): Promise<void>;
  unblockFriend(userId: number, friendId: number): Promise<void>;

  // Friend suggestions
  getFriendSuggestions(userId: number): Promise<User[]>;
  searchUsers(query: string): Promise<User[]>; // Add searchUsers method
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private posts: Map<number, Post>;
  private comments: Map<number, Comment>;
  private stories: Map<number, Story>;
  private conversations: Map<number, any>;
  private messages: Map<number, Message>;
  private communities: Map<number, Community>;
  private likes: Map<string, boolean>;
  private follows: Map<string, boolean>;
  private communityMembers: Map<string, string>; // format: "userId:communityId" -> role
  private movies: Map<number, Movie>;
  private dmcaClaims: Map<number, DMCAClaim>;
  private watchlist: Map<string, boolean>; // key: userId:movieId
  private movieLikes: Map<string, boolean>; // key: userId:movieId
  private movieComments: Map<number, MovieComment>;
  private movieReports: Map<number, MovieReport>;
  private reactions: Map<string, string>;
  private friendRequests: Map<number, FriendRequest>;
  private friendships: Map<string, Friendship>;
  private currentIds: {
    [key: string]: number;
  };
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.posts = new Map();
    this.comments = new Map();
    this.stories = new Map();
    this.conversations = new Map();
    this.messages = new Map();
    this.communities = new Map();
    this.likes = new Map();
    this.follows = new Map();
    this.communityMembers = new Map();
    this.movies = new Map();
    this.dmcaClaims = new Map();
    this.watchlist = new Map();
    this.movieLikes = new Map();
    this.movieComments = new Map();
    this.movieReports = new Map();
    this.reactions = new Map();
    this.friendRequests = new Map();
    this.friendships = new Map();
    this.currentIds = {
      user: 1,
      post: 1,
      comment: 1,
      story: 1,
      conversation: 1,
      message: 1,
      community: 1,
      movie: 1,
      dmcaClaim: 1,
      movieReport: 1,
      friendRequest: 1,
      friendship: 1
    };
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentIds.user++;
    const user: User = {
      ...insertUser,
      id,
      isAdmin: insertUser.isAdmin ?? false,
      role: insertUser.role ?? 'user',
      permissions: insertUser.permissions ?? ['view_content'],
      isVerified: false,
      displayName: insertUser.displayName ?? null,
      bio: null,
      avatarUrl: insertUser.avatarUrl ?? null,
      coverImageUrl: null,
      lastLoginAt: null,
      status: "active",
      location: null,
      website: null,
      createdAt: new Date(),
      googleId: insertUser.googleId ?? null
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserProfile(userId: number, profile: UpdateUserProfile): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

    const updatedUser = { ...user, ...profile };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async getUserCount(): Promise<number> {
    return this.users.size;
  }

  async updateUser(userId: number, updates: Partial<User>): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

    const updatedUser = { ...user, ...updates };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Post methods
  async createPost(userId: number, post: InsertPost): Promise<Post> {
    const id = this.currentIds.post++;
    const newPost: Post = {
      ...post,
      id,
      userId,
      likes: 0,
      shares: 0,
      comments: 0,
      location: post.location ?? null,
      createdAt: new Date(),
      editedAt: null,
      attachments: post.attachments ? [...post.attachments] : null,
      visibility: post.visibility ?? "public",
      hashtags: post.hashtags ?? null
    };
    this.posts.set(id, newPost);
    return newPost;
  }

  async getPost(id: number): Promise<Post | undefined> {
    return this.posts.get(id);
  }

  async getUserPosts(userId: number): Promise<Post[]> {
    return Array.from(this.posts.values())
      .filter(post => post.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getFeedPosts(userId: number): Promise<Post[]> {
    const following = Array.from(this.follows.entries())
      .filter(([key]) => key.startsWith(`${userId}:`))
      .map(([key]) => parseInt(key.split(':')[1]));

    return Array.from(this.posts.values())
      .filter(post => following.includes(post.userId) || post.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async deletePost(id: number): Promise<void> {
    this.posts.delete(id);
  }


  async likePost(userId: number, postId: number): Promise<void> {
    const key = `${userId}:${postId}`;
    if (!this.likes.has(key)) {
      this.likes.set(key, true);
      const post = await this.getPost(postId);
      if (post) {
        this.posts.set(postId, { ...post, likes: post.likes + 1 });
      }
    }
  }

  async unlikePost(userId: number, postId: number): Promise<void> {
    const key = `${userId}:${postId}`;
    if (this.likes.has(key)) {
      this.likes.delete(key);
      const post = await this.getPost(postId);
      if (post) {
        this.posts.set(postId, { ...post, likes: post.likes - 1 });
      }
    }
  }

  async sharePost(userId: number, postId: number): Promise<void> {
    const post = await this.getPost(postId);
    if (post) {
      this.posts.set(postId, { ...post, shares: post.shares + 1 });
    }
  }

  async createComment(userId: number, postId: number, comment: InsertComment): Promise<Comment> {
    const id = this.currentIds.comment++;
    const newComment: Comment = {
      ...comment,
      id,
      postId,
      userId,
      likes: 0,
      createdAt: new Date(),
      editedAt: null,
      parentId: comment.parentId ?? null
    };
    this.comments.set(id, newComment);

    // Update post comment count
    const post = await this.getPost(postId);
    if (post) {
      this.posts.set(postId, { ...post, comments: post.comments + 1 });
    }

    return newComment;
  }

  async getPostComments(postId: number): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter(comment => comment.postId === postId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getThreadedComments(parentId: number): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter(comment => comment.parentId === parentId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async deleteComment(id: number): Promise<void> {
    const comment = this.comments.get(id);
    if (comment) {
      const post = await this.getPost(comment.postId);
      if (post) {
        this.posts.set(post.id, { ...post, comments: post.comments - 1 });
      }
      this.comments.delete(id);
    }
  }

  async likeComment(userId: number, commentId: number): Promise<void> {
    const key = `${userId}:${commentId}`;
    if (!this.likes.has(key)) {
      this.likes.set(key, true);
      const comment = this.comments.get(commentId);
      if (comment) {
        this.comments.set(commentId, { ...comment, likes: comment.likes + 1 });
      }
    }
  }

  async unlikeComment(userId: number, commentId: number): Promise<void> {
    const key = `${userId}:${commentId}`;
    if (this.likes.has(key)) {
      this.likes.delete(key);
      const comment = this.comments.get(commentId);
      if (comment) {
        this.comments.set(commentId, { ...comment, likes: comment.likes - 1 });
      }
    }
  }

  async createStory(userId: number, story: InsertStory): Promise<Story> {
    const id = this.currentIds.story++;
    const newStory: Story = {
      ...story,
      id,
      userId,
      viewers: 0,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      caption: story.caption ?? null
    };
    this.stories.set(id, newStory);
    return newStory;
  }

  async getUserStories(userId: number): Promise<Story[]> {
    return Array.from(this.stories.values()).filter(story => story.userId === userId);
  }

  async getFeedStories(userId: number): Promise<Story[]> {
    const following = Array.from(this.follows.entries())
      .filter(([key]) => key.startsWith(`${userId}:`))
      .map(([key]) => parseInt(key.split(':')[1]));
    return Array.from(this.stories.values()).filter(story => following.includes(story.userId) || story.userId === userId);
  }

  async viewStory(userId: number, storyId: number): Promise<void> {
    const story = this.stories.get(storyId);
    if (story) {
      this.stories.set(storyId, { ...story, viewers: story.viewers + 1 });
    }
  }

  async deleteStory(id: number): Promise<void> {
    this.stories.delete(id);
  }

  async createConversation(userIds: number[], name?: string): Promise<number> {
    const id = this.currentIds.conversation++;
    this.conversations.set(id, { id, userIds, name, createdAt: new Date() });
    return id;
  }

  async getConversations(userId: number): Promise<any[]> {
    return Array.from(this.conversations.values()).filter(convo => convo.userIds.includes(userId));
  }

  async getMessages(conversationId: number, limit?: number): Promise<Message[]> {
    const messages = Array.from(this.messages.values()).filter(msg => msg.conversationId === conversationId);
    return limit ? messages.slice(0, limit) : messages;
  }

  async sendMessage(userId: number, conversationId: number, message: InsertMessage): Promise<Message> {
    const id = this.currentIds.message++;
    const newMessage: Message = {
      ...message,
      id,
      userId,
      conversationId,
      createdAt: new Date(),
      editedAt: null,
      isDeleted: false,
      attachments: message.attachments ?? null
    };
    this.messages.set(id, newMessage);
    return newMessage;
  }

  async deleteMessage(messageId: number): Promise<void> {
    this.messages.delete(messageId);
  }

  async editMessage(messageId: number, content: string): Promise<Message> {
    const message = this.messages.get(messageId);
    if (!message) throw new Error("Message not found");
    const updatedMessage = { ...message, content, editedAt: new Date() };
    this.messages.set(messageId, updatedMessage);
    return updatedMessage;
  }

  async createCommunity(userId: number, community: InsertCommunity): Promise<Community> {
    const id = this.currentIds.community++;
    const newCommunity: Community = {
      ...community,
      id,
      createdAt: new Date(),
      avatarUrl: null,
      coverImageUrl: null,
      description: community.description ?? null,
      type: community.type ?? "public"
    };
    this.communities.set(id, newCommunity);

    // Create the initial membership record
    await this.joinCommunity(userId, id, "owner");

    return newCommunity;
  }

  async getCommunity(id: number): Promise<Community | undefined> {
    return this.communities.get(id);
  }

  async joinCommunity(userId: number, communityId: number, role: string = "member"): Promise<void> {
    const key = `${userId}:${communityId}`;
    this.communityMembers.set(key, role);
  }

  async leaveCommunity(userId: number, communityId: number): Promise<void> {
    const key = `${userId}:${communityId}`;
    this.communityMembers.delete(key);
  }

  async getCommunityMembers(communityId: number): Promise<User[]> {
    const memberIds = Array.from(this.communityMembers.keys())
      .filter(key => key.endsWith(`:${communityId}`))
      .map(key => parseInt(key.split(':')[0]));
    return Promise.all(memberIds.map(id => this.getUser(id))).then(users => users.filter(user => user !== undefined));
  }

  async getCommunityPosts(communityId: number): Promise<Post[]> {
    return Array.from(this.posts.values()).filter(post => post.communityId === communityId);
  }

  // Follow operations
  async followUser(followerId: number, followingId: number): Promise<void> {
    const key = `${followerId}:${followingId}`;
    this.follows.set(key, true);
  }

  async unfollowUser(followerId: number, followingId: number): Promise<void> {
    const key = `${followerId}:${followingId}`;
    this.follows.delete(key);
  }

  async getFollowers(userId: number): Promise<User[]> {
    const followerIds = Array.from(this.follows.entries())
      .filter(([key]) => key.endsWith(`:${userId}`))
      .map(([key]) => parseInt(key.split(':')[0]));

    return Promise.all(followerIds.map(id => this.getUser(id)))
      .then(users => users.filter((user): user is User => user !== undefined));
  }

  async getFollowing(userId: number): Promise<User[]> {
    const followingIds = Array.from(this.follows.entries())
      .filter(([key]) => key.startsWith(`${userId}:`))
      .map(([key]) => parseInt(key.split(':')[1]));

    return Promise.all(followingIds.map(id => this.getUser(id)))
      .then(users => users.filter((user): user is User => user !== undefined));
  }

  async createMovie(uploaderId: number, movie: InsertMovie): Promise<Movie> {
    const id = this.currentIds.movie++;
    const newMovie: Movie = {
      ...movie,
      id,
      uploaderId,
      status: "pending",
      views: 0,
      likes: 0,
      comments: 0,
      createdAt: new Date(),
      updatedAt: null,
      copyrightStatus: {
        isSafe: true,
        confidence: 1,
        lastChecked: new Date()
      }
    };
    this.movies.set(id, newMovie);
    return newMovie;
  }

  async getMovie(id: number): Promise<Movie | undefined> {
    return this.movies.get(id);
  }

  async getMovies(status?: string): Promise<Movie[]> {
    let movies = Array.from(this.movies.values());
    if (status) {
      movies = movies.filter(movie => movie.status === status);
    }
    return movies.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async updateMovieStatus(id: number, status: string): Promise<Movie> {
    const movie = await this.getMovie(id);
    if (!movie) throw new Error("Movie not found");

    const updatedMovie = {
      ...movie,
      status,
      updatedAt: new Date()
    };
    this.movies.set(id, updatedMovie);
    return updatedMovie;
  }

  async updateMovieMetadata(id: number, metadata: any): Promise<Movie> {
    const movie = await this.getMovie(id);
    if (!movie) throw new Error("Movie not found");

    const updatedMovie = {
      ...movie,
      metadata: { ...movie.metadata, ...metadata },
      updatedAt: new Date(),
      copyrightStatus: {
        ...movie.copyrightStatus,
        ...metadata.copyrightStatus
      }
    };
    this.movies.set(id, updatedMovie);
    return updatedMovie;
  }

  async deleteMovie(id: number): Promise<void> {
    this.movies.delete(id);
  }

  async incrementMovieViews(id: number): Promise<void> {
    const movie = await this.getMovie(id);
    if (movie) {
      this.movies.set(id, { ...movie, views: movie.views + 1 });
    }
  }

  async createDMCAClaim(claim: InsertDMCAClaim): Promise<DMCAClaim> {
    const id = this.currentIds.dmcaClaim++;
    const newClaim: DMCAClaim = {
      ...claim,
      id,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: null
    };
    this.dmcaClaims.set(id, newClaim);
    return newClaim;
  }

  async getDMCAClaim(id: number): Promise<DMCAClaim | undefined> {
    return this.dmcaClaims.get(id);
  }

  async updateDMCAClaimStatus(
    id: number,
    status: 'approved' | 'rejected',
    responseMessage?: string
  ): Promise<DMCAClaim> {
    const claim = await this.getDMCAClaim(id);
    if (!claim) throw new Error("DMCA claim not found");

    const updatedClaim = {
      ...claim,
      status,
      responseMessage,
      updatedAt: new Date()
    };
    this.dmcaClaims.set(id, updatedClaim);

    // If approved, update the movie status
    if (status === 'approved') {
      const movie = await this.getMovie(claim.movieId);
      if (movie) {
        await this.updateMovieStatus(movie.id, 'removed_copyright');
      }
    }

    return updatedClaim;
  }

  async getMovieDMCAClaims(movieId: number): Promise<DMCAClaim[]> {
    return Array.from(this.dmcaClaims.values())
      .filter(claim => claim.movieId === movieId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getPendingDMCAClaims(): Promise<DMCAClaim[]> {
    return Array.from(this.dmcaClaims.values())
      .filter(claim => claim.status === 'pending')
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Watchlist implementations
  async addToWatchlist(userId: number, movieId: number): Promise<void> {
    this.watchlist.set(`${userId}:${movieId}`, true);
  }

  async removeFromWatchlist(userId: number, movieId: number): Promise<void> {
    this.watchlist.delete(`${userId}:${movieId}`);
  }

  async getWatchlist(userId: number): Promise<Movie[]> {
    const movieIds = Array.from(this.watchlist.entries())
      .filter(([key]) => key.startsWith(`${userId}:`))
      .map(([key]) => parseInt(key.split(':')[1]));

    return Promise.all(movieIds.map(id => this.getMovie(id)))
      .then(movies => movies.filter((movie): movie is Movie => movie !== undefined));
  }

  // Like implementations
  async likeMovie(userId: number, movieId: number): Promise<void> {
    const key = `${userId}:${movieId}`;
    if (!this.movieLikes.has(key)) {
      this.movieLikes.set(key, true);
      const movie = await this.getMovie(movieId);
      if (movie) {
        this.movies.set(movieId, { ...movie, likes: (movie.likes || 0) + 1 });
      }
    }
  }

  async unlikeMovie(userId: number, movieId: number): Promise<void> {
    const key = `${userId}:${movieId}`;
    if (this.movieLikes.has(key)) {
      this.movieLikes.delete(key);
      const movie = await this.getMovie(movieId);
      if (movie && movie.likes > 0) {
        this.movies.set(movieId, { ...movie, likes: movie.likes - 1 });
      }
    }
  }

  // Comment implementations
  async addMovieComment(userId: number, comment: InsertMovieComment): Promise<MovieComment> {
    const id = this.currentIds.comment++;
    const newComment: MovieComment = {
      ...comment,
      id,
      userId,
      likes: 0,
      createdAt: new Date(),
      updatedAt: null
    };
    this.movieComments.set(id, newComment);

    // Update movie comment count
    const movie = await this.getMovie(comment.movieId);
    if (movie) {
      this.movies.set(movie.id, { ...movie, comments: (movie.comments || 0) + 1 });
    }

    return newComment;
  }

  async getMovieComments(movieId: number): Promise<MovieComment[]> {
    return Array.from(this.movieComments.values())
      .filter(comment => comment.movieId === movieId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async deleteMovieComment(commentId: number): Promise<void> {
    const comment = this.movieComments.get(commentId);
    if (comment) {
      const movie = await this.getMovie(comment.movieId);
      if (movie && movie.comments > 0) {
        this.movies.set(movie.id, { ...movie, comments: movie.comments - 1 });
      }
      this.movieComments.delete(commentId);
    }
  }

  async likeMovieComment(userId: number, commentId: number): Promise<void> {
    const comment = this.movieComments.get(commentId);
    if (comment) {
      this.movieComments.set(commentId, { ...comment, likes: comment.likes + 1 });
    }
  }

  async unlikeMovieComment(userId: number, commentId: number): Promise<void> {
    const comment = this.movieComments.get(commentId);
    if (comment && comment.likes > 0) {
      this.movieComments.set(commentId, { ...comment, likes: comment.likes - 1 });
    }
  }

  // Report implementations
  async reportMovie(userId: number, report: InsertMovieReport): Promise<MovieReport> {
    const id = this.currentIds.movieReport++;
    const newReport: MovieReport = {
      ...report,
      id,
      userId,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: null
    };
    this.movieReports.set(id, newReport);
    return newReport;
  }

  async getMovieReports(movieId: number): Promise<MovieReport[]> {
    return Array.from(this.movieReports.values())
      .filter(report => report.movieId === movieId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async updateReportStatus(reportId: number, status: MovieReport['status']): Promise<void> {
    const report = this.movieReports.get(reportId);
    if (report) {
      this.movieReports.set(reportId, {
        ...report,
        status,
        updatedAt: new Date()
      });
    }
  }

  // Implement reaction methods
  async addReaction(userId: number, postId: number, type: string): Promise<void> {
    const key = `${userId}:${postId}:${type}`;
    this.reactions.set(key, type);
  }

  async removeReaction(userId: number, postId: number): Promise<void> {
    const key = `${userId}:${postId}`;
    if (this.reactions.has(key)) {
      this.reactions.delete(key);
    }
  }

  // Friend request implementations
  async createFriendRequest(senderId: number, request: InsertFriendRequest): Promise<FriendRequest> {
    const id = this.currentIds.friendRequest++;
    const newRequest: FriendRequest = {
      id,
      senderId,
      receiverId: request.receiverId,
      status: 'pending',
      message: request.message ?? null,
      createdAt: new Date(),
      updatedAt: null
    };
    this.friendRequests.set(id, newRequest);
    return newRequest;
  }

  async getFriendRequest(id: number): Promise<FriendRequest | undefined> {
    return this.friendRequests.get(id);
  }

  async getFriendRequestsByUser(userId: number, type: 'sent' | 'received'): Promise<FriendRequest[]> {
    return Array.from(this.friendRequests.values())
      .filter(request =>
        type === 'sent' ? request.senderId === userId : request.receiverId === userId
      )
      .filter(request => request.status === 'pending')
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async updateFriendRequestStatus(id: number, status: 'accepted' | 'rejected'): Promise<FriendRequest> {
    const request = await this.getFriendRequest(id);
    if (!request) throw new Error("Friend request not found");

    const updatedRequest = {
      ...request,
      status,
      updatedAt: new Date()
    };
    this.friendRequests.set(id, updatedRequest);

    // If accepted, create friendship
    if (status === 'accepted') {
      const key = `${Math.min(request.senderId, request.receiverId)}:${Math.max(request.senderId, request.receiverId)}`;
      this.friendships.set(key, {
        user1Id: Math.min(request.senderId, request.receiverId),
        user2Id: Math.max(request.senderId, request.receiverId),
        status: 'active',
        createdAt: new Date(),
        updatedAt: null,
        id: this.currentIds.friendship++
      });
    }

    return updatedRequest;
  }

  // Friendship implementations
  async getFriendships(userId: number): Promise<User[]> {
    const friendships = Array.from(this.friendships.values())
      .filter(f =>
        (f.user1Id === userId || f.user2Id === userId) &&
        f.status === 'active'
      );

    const friendIds = friendships.map(f =>
      f.user1Id === userId ? f.user2Id : f.user1Id
    );

    return Promise.all(
      friendIds.map(id => this.getUser(id))
    ).then(users => users.filter((user): user is User => user !== undefined));
  }

  async checkFriendship(user1Id: number, user2Id: number): Promise<boolean> {
    const key = `${Math.min(user1Id, user2Id)}:${Math.max(user1Id, user2Id)}`;
    const friendship = this.friendships.get(key);
    return !!friendship && friendship.status === 'active';
  }

  async removeFriend(user1Id: number, user2Id: number): Promise<void> {
    const key = `${Math.min(user1Id, user2Id)}:${Math.max(user1Id, user2Id)}`;
    this.friendships.delete(key);
  }

  async blockFriend(userId: number, friendId: number): Promise<void> {
    const key = `${Math.min(userId, friendId)}:${Math.max(userId, friendId)}`;
    const friendship = this.friendships.get(key);
    if (friendship) {
      this.friendships.set(key, { ...friendship, status: 'blocked', updatedAt: new Date() });
    }
  }

  async unblockFriend(userId: number, friendId: number): Promise<void> {
    const key = `${Math.min(userId, friendId)}:${Math.max(userId, friendId)}`;
    const friendship = this.friendships.get(key);
    if (friendship) {
      this.friendships.set(key, { ...friendship, status: 'active', updatedAt: new Date() });
    }
  }

  async getFriendSuggestions(userId: number): Promise<User[]> {
    // Get all users except the current user
    const allUsers = Array.from(this.users.values()).filter(u => u.id !== userId);

    // Get current user's friends
    const userFriends = await this.getFriendships(userId);
    const friendIds = new Set(userFriends.map(friend => friend.id));

    // Filter out existing friends and calculate mutual friends
    const suggestions = await Promise.all(
      allUsers
        .filter(user => !friendIds.has(user.id))
        .map(async user => {
          // Get user's friends
          const usersFriends = await this.getFriendships(user.id);
          const usersFriendIds = new Set(usersFriends.map(f => f.id));

          // Calculate mutual friends
          const mutualCount = Array.from(friendIds).filter(id => usersFriendIds.has(id)).length;

          return {
            ...user,
            isFriend: false,
            mutualFriends: mutualCount
          };
        })
    );

    // Sort by mutual friends count
    return suggestions.sort((a, b) => b.mutualFriends - a.mutualFriends);
  }

  async searchUsers(query: string): Promise<User[]> {
    const searchTerm = query.toLowerCase();
    return Array.from(this.users.values())
      .filter(user =>
        user.username.toLowerCase().includes(searchTerm) ||
        (user.displayName?.toLowerCase().includes(searchTerm)) ||
        user.email.toLowerCase().includes(searchTerm)
      )
      .map(user => ({
        ...user,
        isFriend: false, // Will be updated in the route handler
        mutualFriends: 0 // Will be calculated in the route handler
      }));
  }
}

export const storage = new MemStorage();