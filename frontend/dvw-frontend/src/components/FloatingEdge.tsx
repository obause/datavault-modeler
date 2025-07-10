import { useCallback } from 'react';
import { useStore, getSmoothStepPath, type EdgeProps, Position } from '@xyflow/react';

function FloatingEdge({ id, source, target, markerEnd, style }: EdgeProps) {
  const sourceNode = useStore(useCallback((store) => store.nodes.find(n => n.id === source), [source]));
  const targetNode = useStore(useCallback((store) => store.nodes.find(n => n.id === target), [target]));

  if (!sourceNode || !targetNode) {
    return null;
  }

  // Calculate node centers and dimensions
  const sourceWidth = sourceNode.measured?.width || sourceNode.width || 120;
  const sourceHeight = sourceNode.measured?.height || sourceNode.height || 80;
  const targetWidth = targetNode.measured?.width || targetNode.width || 120;
  const targetHeight = targetNode.measured?.height || targetNode.height || 80;

  const sourceCenter = {
    x: sourceNode.position.x + sourceWidth / 2,
    y: sourceNode.position.y + sourceHeight / 2,
  };

  const targetCenter = {
    x: targetNode.position.x + targetWidth / 2,
    y: targetNode.position.y + targetHeight / 2,
  };

  // Determine connection positions based on relative positions
  const dx = targetCenter.x - sourceCenter.x;
  const dy = targetCenter.y - sourceCenter.y;

  let sourcePos: Position, targetPos: Position;
  let sx: number, sy: number, tx: number, ty: number;

  if (Math.abs(dx) > Math.abs(dy)) {
    // Horizontal connection
    if (dx > 0) {
      sourcePos = Position.Right;
      targetPos = Position.Left;
      sx = sourceNode.position.x + sourceWidth;
      sy = sourceCenter.y;
      tx = targetNode.position.x;
      ty = targetCenter.y;
    } else {
      sourcePos = Position.Left;
      targetPos = Position.Right;
      sx = sourceNode.position.x;
      sy = sourceCenter.y;
      tx = targetNode.position.x + targetWidth;
      ty = targetCenter.y;
    }
  } else {
    // Vertical connection
    if (dy > 0) {
      sourcePos = Position.Bottom;
      targetPos = Position.Top;
      sx = sourceCenter.x;
      sy = sourceNode.position.y + sourceHeight;
      tx = targetCenter.x;
      ty = targetNode.position.y;
    } else {
      sourcePos = Position.Top;
      targetPos = Position.Bottom;
      sx = sourceCenter.x;
      sy = sourceNode.position.y;
      tx = targetCenter.x;
      ty = targetNode.position.y + targetHeight;
    }
  }

  const [edgePath] = getSmoothStepPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: sourcePos,
    targetPosition: targetPos,
    targetX: tx,
    targetY: ty,
  });

  return (
    <path
      id={id}
      className="react-flow__edge-path"
      d={edgePath}
      markerEnd={markerEnd}
      style={style}
    />
  );
}

export default FloatingEdge; 