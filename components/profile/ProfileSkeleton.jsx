export default function ProfileSkeleton() {
  return (
    <div className="w-full max-w-2xl mx-auto pb-4">
      <div className="mb-4 pt-2 md:pt-0 flex items-end justify-center">
        <div className="text-center">
          <h1 className="font-headline-md text-[35px] font-bold text-text-primary">Profil Saya</h1>
          <p className="font-body-sm text-[14px] text-text-secondary mt-0.5">Kelola informasi akun Anda.</p>
        </div>
      </div>
      <div className="bg-surface-container border border-outline-variant/30 rounded-2xl p-5 md:p-6 shadow-md">
        <div className="flex flex-col items-center mb-6 pb-6 border-b border-outline-variant/30">
          <div className="w-24 h-24 rounded-full bg-surface-container-high animate-pulse mb-3"></div>
          <div className="h-5 w-32 bg-surface-container-high animate-pulse rounded-md mb-1"></div>
          <div className="h-4 w-40 bg-surface-container-high animate-pulse rounded-md mt-0.5"></div>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="h-3 w-20 bg-surface-container-high animate-pulse rounded-md ml-1"></div>
              <div className="h-10 w-full bg-surface-container-high animate-pulse rounded-xl"></div>
            </div>
            <div className="space-y-1.5">
              <div className="h-3 w-24 bg-surface-container-high animate-pulse rounded-md ml-1"></div>
              <div className="h-10 w-full bg-surface-container-high animate-pulse rounded-xl"></div>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="h-3 w-20 bg-surface-container-high animate-pulse rounded-md ml-1"></div>
            <div className="h-10 w-full bg-surface-container-high animate-pulse rounded-xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
