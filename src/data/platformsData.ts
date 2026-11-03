import { Platform, Batch } from '../types';

export const PLATFORMS_DATA: Platform[] = [];

export const BATCHES_DATA: Batch[] = [
  {
    id: 'yakeen-2027',
    platformId: 'pw',
    name: 'Yakeen 2027',
    badge: 'New',
    bannerImage: '/batches/yakeen_banner.jpg',
    targetExam: 'For NEET Aspirants',
    startDate: '15 Apr 2026',
    endDate: '01 Jul 2027',
    originalPrice: 3800,
    discountedPrice: 'FREE',
    freeBadgeText: '100% Free For Students',
    category: 'NEET',
    subjects: [
      {
        id: 'phy',
        name: 'Physics',
        chapters: [
          {
            id: 'phy-1',
            title: 'Units and Measurements',
            lecturesCount: 6,
            dppCount: 6,
            notesCount: 6,
            lectures: [
              { id: 'l1', title: '01 : Fundamental & Derived Units', duration: '1h 14m', teacherName: 'MR Sir' },
              { id: 'l2', title: '02 : Dimensional Analysis & Applications', duration: '1h 22m', teacherName: 'MR Sir' },
              { id: 'l3', title: '03 : Significant Figures & Vernier Calipers', duration: '1h 05m', teacherName: 'MR Sir' },
            ]
          }
        ]
      }
    ]
  }
];

export const UPCOMING_EVENTS = [
  {
    id: 'up-1',
    title: 'NEET 2027 All India Grand Mock Test 1',
    date: '10 Nov 2026 • 02:00 PM',
    platform: 'GB STUDY',
    tag: 'Live Test',
    enrolled: '14,280 Students',
  },
  {
    id: 'up-2',
    title: 'Organic Chemistry Roadmap & Reactions Session',
    date: '14 Nov 2026 • 06:00 PM',
    platform: 'GB STUDY LIVE',
    tag: 'Webinar',
    enrolled: '8,920 Students',
  }
];
