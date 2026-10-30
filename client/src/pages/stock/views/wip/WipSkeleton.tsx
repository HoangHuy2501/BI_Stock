interface WipSkeletonProps {
  rows?: number;
  tall?: boolean;
}

const WipSkeleton = ({ rows = 3, tall = false }: WipSkeletonProps) => (
  <div className="wip-skel" role="status" aria-label="Loading WIP data">
    {tall ? <div className="wip-skel-bar is-tall" /> : null}
    {Array.from({ length: rows }, (_value: unknown, index: number) => (
      <div className="wip-skel-bar" key={index} />
    ))}
  </div>
);

export default WipSkeleton;
