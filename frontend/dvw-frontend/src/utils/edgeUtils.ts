import { Position, type Node } from '@xyflow/react';

// returns the position (top,right,bottom or left) passed node compared to the other node
function getNodePositionWithOffsets(node: Node, targetNode: Node) {
  const nodeRect = {
    x: node.position.x,
    y: node.position.y,
    width: node.measured?.width || node.width || 120,
    height: node.measured?.height || node.height || 80,
  };

  const targetRect = {
    x: targetNode.position.x,
    y: targetNode.position.y,
    width: targetNode.measured?.width || targetNode.width || 120,
    height: targetNode.measured?.height || targetNode.height || 80,
  };

  const nodeCenter = {
    x: nodeRect.x + nodeRect.width / 2,
    y: nodeRect.y + nodeRect.height / 2,
  };

  const targetCenter = {
    x: targetRect.x + targetRect.width / 2,
    y: targetRect.y + targetRect.height / 2,
  };

  const dx = targetCenter.x - nodeCenter.x;
  const dy = targetCenter.y - nodeCenter.y;

  // Determine which side of the node should be used for connection
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? Position.Right : Position.Left;
  } else {
    return dy > 0 ? Position.Bottom : Position.Top;
  }
}

// returns the parameters (sx, sy, tx, ty, sourcePos, targetPos) you need to create an edge
export function getEdgeParams(source: Node, target: Node) {
  const sourceIntersectionPoint = getNodePositionWithOffsets(source, target);
  const targetIntersectionPoint = getNodePositionWithOffsets(target, source);

  // Use measured dimensions if available, otherwise use default sizes
  const sourceRect = {
    x: source.position.x,
    y: source.position.y,
    width: source.measured?.width || source.width || 120,
    height: source.measured?.height || source.height || 80,
  };

  const targetRect = {
    x: target.position.x,
    y: target.position.y,
    width: target.measured?.width || target.width || 120,
    height: target.measured?.height || target.height || 80,
  };

  const getPointOnRectangle = (
    { x, y, width, height }: { x: number; y: number; width: number; height: number },
    position: Position
  ) => {
    switch (position) {
      case Position.Top:
        return { x: x + width / 2, y: y };
      case Position.Right:
        return { x: x + width, y: y + height / 2 };
      case Position.Bottom:
        return { x: x + width / 2, y: y + height };
      case Position.Left:
        return { x: x, y: y + height / 2 };
    }
  };

  const sourcePoint = getPointOnRectangle(sourceRect, sourceIntersectionPoint);
  const targetPoint = getPointOnRectangle(targetRect, targetIntersectionPoint);

  return {
    sx: sourcePoint.x,
    sy: sourcePoint.y,
    tx: targetPoint.x,
    ty: targetPoint.y,
    sourcePos: sourceIntersectionPoint,
    targetPos: targetIntersectionPoint,
  };
} 