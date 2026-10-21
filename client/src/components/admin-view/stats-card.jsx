function StatsCard({title, value, icon: Icon, accent = "rose"}) {
  const accents = {
    rose: "from-rose/15 to-rose-deep/10 text-rose-deep",
    gold: "from-gold/20 to-gold/5 text-gold",
    sage: "from-sage/20 to-sage/5 text-sage",
    espresso: "from-espresso/15 to-mocha/5 text-espresso",
  };

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-sand bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-blush/40">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-taupe">{title}</p>
          <p className="mt-3 font-display text-3xl font-semibold text-espresso">{value ?? 0}</p>
        </div>
        {Icon ? (
          <span className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${accents[accent] || accents.rose}`}>
            <Icon className="h-5 w-5"/>
          </span>
        ) : null}
      </div>
      <span className="absolute -bottom-6 -right-6 h-20 w-20 rounded-full bg-blush/30 transition-transform duration-500 group-hover:scale-150"/>
    </div>
  );
}

export default StatsCard;
