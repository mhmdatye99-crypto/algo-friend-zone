import { Component, ReactNode } from "react";

interface State {
  hasError: boolean;
  message: string;
}

class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message || String(error) };
  }

  componentDidCatch(error: Error) {
    console.error("Runtime error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center" dir="rtl">
          <div className="max-w-md space-y-3">
            <h1 className="text-xl font-bold text-foreground">حدث خطأ غير متوقع</h1>
            <p className="text-sm text-muted-foreground font-mono break-words">{this.state.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold"
            >
              إعادة تحميل الصفحة
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
