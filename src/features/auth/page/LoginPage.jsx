import LoginForm from "../component/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#100d0e] px-4 py-6 text-white sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <section className="grid w-full max-w-[1120px] grid-cols-1 overflow-hidden rounded-xl border border-[#2d282b] bg-[#171314] lg:grid-cols-[1fr_440px]">
        <div className="relative flex min-h-[320px] flex-col justify-between border-b border-[#2d282b] bg-[#120f10] p-6 sm:min-h-[420px] sm:p-8 lg:min-h-[620px] lg:border-b-0 lg:border-r lg:p-10">
          <div>
            <img
              src="https://flynextbd.com/wp-content/uploads/2023/09/Fly-Next-PNG-abhaya-Lib-Font.png"
              alt="Fly Next"
              className="h-9 w-auto sm:h-11"
            />
          </div>

          <div className="max-w-[520px]">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-400">
              Expense operations
            </p>
            <h2 className="mt-5 text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
              Manage expenses, balances, and admin tools from one workspace.
            </h2>
            <p className="mt-4 text-sm leading-6 text-[#b4c5df] sm:mt-5 sm:text-base sm:leading-7">
              Secure access for daily finance administration.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
            {["Expenses", "Accounts", "Reports"].map((item) => (
              <div key={item} className="rounded-md border border-[#2d282b] bg-[#1d181a] px-4 py-3 font-semibold text-white">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center bg-[#171314] p-4 sm:p-6 lg:p-8">
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
