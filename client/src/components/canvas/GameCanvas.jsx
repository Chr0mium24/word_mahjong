import React, { useRef, useCallback, useState, useEffect } from 'react';
import { Stage, Layer, Rect } from 'react-konva';
import throttle from 'lodash.throttle';
import { useSocket } from '../../context/SocketContext';
import useSocketListener from '../../hooks/useSocketListener';
import Tile from './Tile';



const GameCanvas = ({ tiles, playerId }) => {
    const socket = useSocket();
    const [konvaTiles, setKonvaTiles] = useState(tiles);
    const stageRef = useRef(null);

    // --- TODO 1: 动态获取父容器尺寸 ---
    // 1. 创建一个 ref 来引用父容器 div
    const containerRef = useRef(null);
    // 2. 创建一个 state 来存储容器的尺寸
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    // 3. 使用 useEffect 来在组件挂载和窗口大小改变时更新尺寸
    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.offsetWidth,
                    height: containerRef.current.offsetHeight,
                });
            }
        };

        // 首次挂载时执行一次
        updateSize();
        // 监听窗口 resize 事件
        window.addEventListener('resize', updateSize);

        // 组件卸载时移除监听器，防止内存泄漏
        return () => window.removeEventListener('resize', updateSize);
    }, []); // 空依赖数组确保此 effect 只在挂载和卸载时运行

    // 当外部 tiles 属性更新时，同步到内部 state
    useEffect(() => {
        setKonvaTiles(tiles);
    }, [tiles]);

    const throttledMove = useRef(
        throttle(({ tileId, position }) => {
            socket.emit('moveTile', { tileId, position });
        }, 1000 / 20) // 优化为每秒最多20次
    ).current;

    useSocketListener('tileMoved', ({ tileId, position }) => {
        setKonvaTiles(currentTiles =>
            currentTiles.map(tile =>
                tile.id === tileId ? { ...tile, pos: position } : tile
            )
        );
    });

    const handleDragMove = useCallback((tileId, newPosition) => {
        throttledMove({ tileId, position: newPosition });
    }, [throttledMove]);

    const handleDragEnd = useCallback((tileId, finalPosition) => {
        throttledMove.cancel();
        // 现在拖拽结束只同步最终位置
        socket.emit('moveTile', { tileId, position: finalPosition });
    }, [socket, throttledMove]);

    const handlePlayTile = useCallback((tileId, currentPosition) => {
        console.log(`Tile ${tileId} played via double-click.`);
        // 服务器将决定牌被打出后的最终位置，但我们可以发送当前位置作为参考
        socket.emit('playTile', { tileId, position: currentPosition });
    }, [socket]);

    return (
        <div ref={containerRef} className="absolute top-0 left-0 w-full h-full bg-gray-700">
            <Stage width={dimensions.width} height={dimensions.height}>
                {/* ... (Background Layer with optional PUBLIC_ZONE rect) */}
                <Layer>
                    {konvaTiles.map(tile => (
                        <Tile
                            key={tile.id}
                            tileData={tile}
                            isOwner={tile.owner === playerId}
                            onDragMove={handleDragMove}
                            onDragEnd={handleDragEnd}
                            onPlayTile={handlePlayTile} // NEW: 传递新的 prop
                        />
                    ))}
                </Layer>
            </Stage>
        </div>
    );

};

export default GameCanvas;