import React from "react";
import { Group, Rect, Text } from "react-konva";

const TILE_WIDTH = 60;
const TILE_HEIGHT = 80;

const Tile = ({ tileData, isOwner, onDragMove, onDragEnd }) => {
    const { id, char, pos } = tileData;

    const handleDragMove = (e) => {
        onDragMove(id, { x: e.target.x(), y: e.target.y() });
    };

    const handleDragEnd = (e) => {
        onDragEnd(id, { x: e.target.x(), y: e.target.y() });
    };

    return (
        <Group
            x={pos.x}
            y={pos.y}
            width={TILE_WIDTH}
            height={TILE_HEIGHT}
            draggable={isOwner} // 只有拥有者可以拖动
            onDragMove={handleDragMove}
            onDragEnd={handleDragEnd}
        >
            <Rect
                width={TILE_WIDTH}
                height={TILE_HEIGHT}
                fill={isOwner ? "#14B8A6" : "#4B5563"} // Teal for owner, Gray for others
                cornerRadius={8}
                stroke="#111827"
                strokeWidth={2}
                shadowColor="black"
                shadowBlur={10}
                shadowOpacity={0.5}
                shadowOffsetX={5}
                shadowOffsetY={5}
            />
            {/* 核心逻辑：只有拥有者或牌是公开的，才显示文字 */}
            {(isOwner || tileData.isPublic) && (
                <Text
                    text={char}
                    fontSize={32}
                    fontFamily="serif"
                    fill="white"
                    width={TILE_WIDTH}
                    height={TILE_HEIGHT}
                    align="center"
                    verticalAlign="middle"
                    listening={false} // 文字本身不响应点击事件
                />
            )}
        </Group>
    );
};

export default Tile;
