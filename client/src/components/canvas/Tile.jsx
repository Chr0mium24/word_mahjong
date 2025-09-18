import React from 'react';
import { Group, Rect, Text } from 'react-konva';

function Tile({ id, x, y, char, isFaceUp, onDoubleClick, onDragEnd }) {

    const TILE_WIDTH = 60;
    const TILE_HEIGHT = 90;

    const handleDragEnd = e => {
        if (onDragEnd) {
            onDragEnd({ x: e.target.x(), y: e.target.y() });
        }
    };

    return (
        <Group
            x={x}
            y={y}
            width={TILE_WIDTH}
            height={TILE_HEIGHT}
            draggable
            onDblClick={onDoubleClick}
            onDragEnd={handleDragEnd}
        >
            {/* 牌的背景和边框 */}
            <Rect
                width={TILE_WIDTH}
                height={TILE_HEIGHT}
                fill={isFaceUp ? '#FEFCE8' : '#A4A4A4'} // 米黄色牌面或灰色牌背
                stroke="#333"
                strokeWidth={2}
                cornerRadius={5}
                shadowColor="black"
                shadowBlur={5}
                shadowOffset={{ x: 2, y: 2 }}
                shadowOpacity={0.5}
            />

            {/* 如果牌是正面朝上，则显示文字 */}
            {isFaceUp && (
                <Text
                    text={char}
                    fontSize={32}
                    fontFamily="KaiTi, serif" // 使用楷体等有中式风格的字体
                    fill="black"
                    width={TILE_WIDTH}
                    height={TILE_HEIGHT}
                    align="center"
                    verticalAlign="middle"
                    listening={false} // 文字不接收事件，让Group接收
                />
            )}
        </Group>
    );
}

export default Tile;