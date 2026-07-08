export default function Home() {
  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center justify-center text-center mt-20 space-y-6">
      <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-slate-800">
        Bem-vindo ao <span className="text-blue-600">OftalmoHelper</span>
      </h1>
      <p className="text-lg text-slate-600 max-w-2xl">
        Utilize o menu lateral para acessar os scripts de atendimento, gerenciar seus textos rápidos,
        consultar o corpo clínico ou pesquisar por restrições e laudos de exames oftalmológicos.
      </p>
    </div>
  );
}