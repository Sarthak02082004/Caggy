import * as React from 'react';
import {Pagination} from '@shopify/hydrogen';

export function PaginatedResourceSection({
  connection,
  children,
  resourcesClassName,
}) {
  const loadMoreRef = React.useRef(null);

  return (
    <Pagination connection={connection}>
      {({nodes, isLoading, PreviousLink, NextLink}) => {
        const resourcesMarkup = nodes.map((node, index) =>
          children({node, index}),
        );

        // 👇 Auto trigger logic
        React.useEffect(() => {
          if (!loadMoreRef.current) return;

          const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
              const link = loadMoreRef.current.querySelector('a');
              if (link) link.click(); // auto click NextLink
            }
          });

          observer.observe(loadMoreRef.current);

          return () => observer.disconnect();
        }, [nodes]);

        return (
          <div>

            {/* Optional: remove this if not needed */}
            <PreviousLink>
              {isLoading ? 'Loading...' : <span>↑ Load previous</span>}
            </PreviousLink>

            {/* Products */}
            {resourcesClassName ? (
              <div className={resourcesClassName}>{resourcesMarkup}</div>
            ) : (
              resourcesMarkup
            )}

            {/* 👇 Invisible auto-loader */}
            <div ref={loadMoreRef} style={{height: '40px'}}>
              <NextLink>
                {isLoading ? 'Loading...' : ''}
              </NextLink>
            </div>

          </div>
        );
      }}
    </Pagination>
  );
}