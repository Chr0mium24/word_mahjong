// src/components/canvas/Tile.jsx

import React from 'react'; // 引入 React
import { Group, Rect, Text } from 'react-konva';

const TILE_WIDTH = 60;
const TILE_HEIGHT = 80;

const Tile = ({ tileData, isOwner, onDragStart, onDragMove, onDragEnd, onPlayTile }) => {
    const { id, char, pos } = tileData;

    const handleDragStart = (e) => {
        // NEW: 通知父组件拖拽开始
        onDragStart(id);
        // 给被拖拽的方块一个轻微的抬起效果
        e.target.to({
            scaleX: 1.05,
            scaleY: 1.05,
            shadowOffsetX: 10,
            shadowOffsetY: 10,
            duration: 0.1
        });
    };

    const handleDragMove = (e) => {
        onDragMove(id, { x: e.target.x(), y: e.target.y() });
    };

    const handleDragEnd = (e) => {
        // NEW: 通知父组件拖拽结束
        onDragEnd(id, { x: e.target.x(), y: e.target.y() });
        // 恢复方块的正常状态
        e.target.to({
            scaleX: 1,
            scaleY: 1,
            shadowOffsetX: 5,
            shadowOffsetY: 5,
            duration: 0.2
        });
    };

    const handleDoubleClick = () => {
        if (isOwner) {
            onPlayTile(id, pos);
        }
    };

    return (
        <Group
            x={pos.x}
            y={pos.y}
            width={TILE_WIDTH}
            height={TILE_HEIGHT}
            draggable={isOwner}
            onDragStart={handleDragStart} // NEW: 添加 onDragStart
            onDragMove={handleDragMove}
            onDragEnd={handleDragEnd}
            onDblClick={handleDoubleClick}
        >
            <Rect
                width={TILE_WIDTH}
                height={TILE_HEIGHT}
                fill={isOwner ? '#14B8A6' : '#4B5563'}
                cornerRadius={8}
                stroke="#111827"
                strokeWidth={2}
                shadowColor="black"
                shadowBlur={10}
                shadowOpacity={0.5}
                shadowOffsetX={5}
                shadowOffsetY={5}
            />
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
                    listening={false}
                />
            )}
        </Group>
    );
};

// ---  最关键的优化 ---
// 使用 React.memo 包裹组件。
// 只有当 tileData 或 isOwner 等 props 实际发生变化时，这个组件才会重新渲染。
export default React.memo(Tile);