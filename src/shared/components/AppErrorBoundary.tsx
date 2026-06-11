import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
  message: string;
};

export class AppErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    message: "",
  };

  static getDerivedStateFromError(error: unknown): State {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : "Неизвестная ошибка",
    };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    const payload = {
      event: "frontend.runtime_error",
      message: error instanceof Error ? error.message.slice(0, 240) : String(error).slice(0, 240),
      componentStack: info.componentStack?.slice(0, 500),
      ts: new Date().toISOString(),
    };
    console.error(JSON.stringify(payload));
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="min-h-screen bg-[var(--rzm-surface-canvas)] text-[var(--rzm-text-main)] grid place-items-center px-4">
        <section className="rzm-card max-w-[560px] p-5 md:p-6">
          <div className="eyebrow mb-4">Ошибка интерфейса</div>
          <h1 className="font-display text-[30px] md:text-[42px] font-bold tracking-[-0.04em] leading-[1]">
            Что-то пошло не так
          </h1>
          <p className="mt-4 text-[14px] leading-[1.6] text-[var(--rzm-text-muted)]">
            Обновите страницу. Если ошибка повторится, напишите в поддержку и укажите, на каком шаге она возникла.
          </p>
          <div className="mt-4 rzm-status" data-status="warning">
            <span>Сообщение для диагностики: {this.state.message.slice(0, 160)}</span>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
              Обновить страницу
            </button>
            <a className="btn btn-outline" href="/">
              На главную
            </a>
          </div>
        </section>
      </main>
    );
  }
}
