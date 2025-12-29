// 已移除对外部 Gemini 客户端的直接依赖。
// 为保持接口兼容性，导出一个简单的占位函数，返回静态问候语。
// 如果未来需要重新接入 AI，请在后端实现代理并在前端调用后端接口。

export const generateHolidayGreeting = async (): Promise<string> => {
  return "圣诞快乐（AI 已移除，使用静态问候）";
};