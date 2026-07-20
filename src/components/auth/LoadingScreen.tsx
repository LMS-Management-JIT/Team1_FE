export const LoadingScreen = () => (
    <div className="grid min-h-screen place-items-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
            <p className="text-sm text-slate-500">Đang xác thực...</p>
        </div>
    </div>
);