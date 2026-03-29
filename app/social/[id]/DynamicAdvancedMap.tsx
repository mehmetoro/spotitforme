import dynamic from 'next/dynamic';

export const DynamicAdvancedMap = dynamic(() => import('@/components/AdvancedMap'), { ssr: false });
