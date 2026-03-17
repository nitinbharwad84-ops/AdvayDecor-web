export default function ProductLoading() {
    return (
        <div style={{ paddingTop: 'var(--nav-height, 80px)', minHeight: '80vh', backgroundColor: '#fdfbf7' }}>
            <section style={{ padding: '2rem 0 3rem' }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' }}>
                    
                    {/* Breadcrumb Skeleton */}
                    <div className="w-1/3 h-4 bg-gray-200 rounded animate-pulse mb-8"></div>

                    <div className="grid grid-cols-1 lg:grid-cols-[45%_55%]" style={{ gap: '2rem', alignItems: 'flex-start' }}>
                        
                        {/* Gallery Skeleton */}
                        <div className="w-full flex-col gap-4 hidden lg:flex">
                            <div className="w-full aspect-square bg-gray-200 rounded-xl animate-pulse"></div>
                            <div className="flex gap-3">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="flex-1 aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
                                ))}
                            </div>
                        </div>
                        <div className="w-full aspect-square bg-gray-200 rounded-xl animate-pulse block lg:hidden mb-4"></div>

                        {/* Product Info Skeleton */}
                        <div className="flex flex-col gap-6">
                            <div>
                                <div className="w-24 h-4 bg-gray-200 rounded animate-pulse mb-3"></div>
                                <div className="w-3/4 h-10 bg-gray-200 rounded animate-pulse mb-4"></div>
                                <div className="w-1/3 h-5 bg-gray-200 rounded animate-pulse"></div>
                            </div>

                            <div className="flex flex-col gap-2 mb-2">
                                <div className="w-full h-4 bg-gray-200 rounded animate-pulse"></div>
                                <div className="w-full h-4 bg-gray-200 rounded animate-pulse"></div>
                                <div className="w-2/3 h-4 bg-gray-200 rounded animate-pulse"></div>
                            </div>

                            <div className="w-1/4 h-8 bg-gray-200 rounded animate-pulse"></div>
                            
                            <hr className="border-gray-200" />
                            
                            <div className="w-full h-24 bg-gray-200 rounded-xl animate-pulse"></div>
                            
                            <div className="flex gap-4">
                                <div className="flex-1 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
                                <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
                            </div>

                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
