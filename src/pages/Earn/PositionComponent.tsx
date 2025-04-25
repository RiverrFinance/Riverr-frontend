import React from "react";

interface Props {
  StakeId: bigint;
  closePosition: bigint;
}

export default function PositionComponent({ StakeId, closePosition }: Props) {
  return <div>PositionComponent</div>;
}
