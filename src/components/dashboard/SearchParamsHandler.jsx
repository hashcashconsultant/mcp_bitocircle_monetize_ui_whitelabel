'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function SearchParamsHandler() {
    const searchParams = useSearchParams();

    useEffect(() => {
        const childUserId = searchParams.get('creator-id');

        if (childUserId) {
            localStorage.setItem('childUserId', childUserId);
            console.log('Child user ID stored:', childUserId);
        }
    }, [searchParams]);

    return null;
}
