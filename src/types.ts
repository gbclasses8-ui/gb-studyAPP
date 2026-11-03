export type OpenMode = 'new_tab' | 'same_tab' | 'batches' | 'internal' | 'external';
export type TabPlacement = 'live' | 'upcoming';

export interface Platform {
  id: string;
  name: string;
  subtitle: string;
  logo: string;
  url?: string;
  bgColor?: string;
  badge?: string;
  category?: string;
  batchesCount: number;
  openMode: OpenMode;
  tabPlacement: TabPlacement;
  order: number; // 1, 2, 3... sequence position
  createdAt?: string;
}

export interface BannerSlide {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  actionUrl: string;
  actionType: 'telegram' | 'platform' | 'external' | 'tutorial';
  badgeText?: string;
  authorText?: string;
  handleText?: string;
  order?: number;
}

export interface Batch {
  id: string;
  platformId: string;
  name: string;
  badge?: string;
  bannerImage: string;
  targetExam: string;
  startDate: string;
  endDate: string;
  originalPrice: number;
  discountedPrice: number | 'FREE';
  freeBadgeText: string;
  category: 'NEET' | 'JEE' | 'Class 11' | 'Class 12' | 'Foundation' | 'SSC / State Exams' | 'Coding' | 'Teaching';
  subjects: {
    id: string;
    name: string;
    chapters: {
      id: string;
      title: string;
      lecturesCount: number;
      dppCount: number;
      notesCount: number;
      lectures: {
        id: string;
        title: string;
        duration: string;
        videoUrl?: string;
        teacherName: string;
      }[];
    }[];
  }[];
}

export interface UserProfile {
  name: string;
  enrolledBatches: string[];
  activeMinutes: number;
  hasSeenWelcome: boolean;
  hasSeenTelegram: boolean;
}
