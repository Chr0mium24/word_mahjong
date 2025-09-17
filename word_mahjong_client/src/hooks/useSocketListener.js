import { useEffect } from "react";
import { useSocket } from "../context/SocketContext";

const useSocketListener = (eventName, callback) => {
  const socket = useSocket();

  useEffect(() => {
    socket.on(eventName, callback);

    // 组件卸载时清理监听器
    return () => {
      socket.off(eventName, callback);
    };
  }, [socket, eventName, callback]);
};

export default useSocketListener;
