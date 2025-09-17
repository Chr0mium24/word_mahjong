import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css"; // 引入包含Tailwind CSS指令的全局CSS文件
import App from "./components/App";

// 获取HTML中的根元素
const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement);

// 渲染整个应用
// React.StrictMode 是一个辅助组件，可以帮助你发现应用中的潜在问题
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
