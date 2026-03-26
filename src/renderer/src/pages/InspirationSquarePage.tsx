import type { InspirationCategoryId } from '../ui-shell-data';
import { INSPIRATION_BANNERS, INSPIRATION_CATEGORIES, INSPIRATION_ITEMS } from '../ui-shell-data';
import { useI18n } from '../i18n';

interface InspirationSquarePageProps {
  selectedCategory: InspirationCategoryId;
  onSelectCategory: (category: InspirationCategoryId) => void;
  onOpenItem: (itemId: string) => void;
  onUsePrompt: (prompt: string) => void;
}

export function InspirationSquarePage({
  selectedCategory,
  onSelectCategory,
  onOpenItem,
  onUsePrompt
}: InspirationSquarePageProps) {
  const { t } = useI18n();

  const visibleItems =
    selectedCategory === 'all' ? INSPIRATION_ITEMS : INSPIRATION_ITEMS.filter((item) => item.categoryId === selectedCategory);

  return (
    <section className="h-full overflow-y-auto rounded-[34px] border border-white/70 bg-[linear-gradient(180deg,#fffdf9_0%,#fbf3ea_100%)] p-6 shadow-[0_24px_80px_rgba(96,66,34,0.12)]">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold tracking-[0.14em] text-[#a58468]">{t('shell.inspiration.page.eyebrow')}</div>
          <h1 className="mt-2 max-w-[54rem] text-[2.1rem] font-semibold tracking-[-0.04em] text-[#241914]">{t('shell.inspiration.page.title')}</h1>
          <p className="mt-3 max-w-[48rem] text-sm leading-7 text-[#766352]">{t('shell.inspiration.page.description')}</p>
        </div>

        <div className="rounded-[30px] border border-[#efdfcf] bg-white/82 px-5 py-4 shadow-[0_16px_30px_rgba(151,107,69,0.08)]">
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#aa896d]">{t('shell.inspiration.page.featured')}</div>
          <div className="mt-2 text-[1.5rem] font-semibold tracking-[-0.03em] text-[#231815]">
            {visibleItems.length} / {INSPIRATION_ITEMS.length}
          </div>
          <div className="mt-1 text-sm text-[#7b6656]">{t(`shell.inspiration.category.${selectedCategory}`)}</div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {INSPIRATION_BANNERS.map((banner) => (
          <article
            key={banner.id}
            className="overflow-hidden rounded-[32px] border border-[#e8d6c2] p-5 shadow-[0_18px_36px_rgba(153,108,67,0.08)]"
            style={{ background: banner.accent }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="max-w-[32rem]">
                <div className="text-sm font-semibold tracking-[0.14em] text-[#8d653c]">{t('shell.inspiration.page.featured')}</div>
                <h2 className="mt-3 text-[1.45rem] font-semibold tracking-[-0.03em] text-[#241914]">{t(banner.titleKey)}</h2>
                <p className="mt-3 text-sm leading-7 text-[#6c5848]">{t(banner.descriptionKey)}</p>
              </div>
              <span className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-white/64 text-3xl">{banner.icon}</span>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-6 rounded-[28px] border border-[#efdfcf] bg-white/72 p-4 shadow-[0_12px_24px_rgba(151,107,69,0.06)]">
        <div className="flex flex-wrap gap-3">
          {INSPIRATION_CATEGORIES.map((category) => {
            const active = category.id === selectedCategory;

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => onSelectCategory(category.id)}
                className={[
                  'rounded-full border px-4 py-2 text-sm font-semibold transition',
                  active ? 'border-[#efbf8a] bg-[#fff1e1] text-[#241914]' : 'border-[#ead7c5] bg-white text-[#745f50] hover:bg-[#fff7ef]'
                ].join(' ')}
              >
                {t(category.labelKey)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibleItems.map((item) => (
          <article
            key={item.id}
            className="group cursor-pointer overflow-hidden rounded-[30px] border border-[#efdfcf] bg-white/86 shadow-[0_16px_32px_rgba(151,107,69,0.08)] transition-all duration-200 hover:translate-y-[-2px] hover:shadow-[0_22px_40px_rgba(151,107,69,0.12)]"
            onClick={() => onOpenItem(item.id)}
          >
            <div className="p-5" style={{ background: item.accent }}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9c6d44]">{t(`shell.inspiration.category.${item.categoryId}`)}</div>
                  <h3 className="mt-3 text-[1.15rem] font-semibold text-[#241914]">{t(item.titleKey)}</h3>
                </div>
                <span className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-white/62 text-2xl">{item.icon}</span>
              </div>
            </div>

            <div className="p-5">
              <p className="text-sm leading-7 text-[#715d4d]">{t(item.descriptionKey)}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onOpenItem(item.id);
                  }}
                  className="rounded-full border border-[#ead7c5] bg-white px-4 py-2 text-sm font-semibold text-[#745f50] transition hover:bg-[#fff7ef]"
                >
                  {t('shell.inspiration.page.viewDetail')}
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onUsePrompt(t(item.promptKey));
                  }}
                  className="rounded-full border border-[#e6bb8f] bg-[#241b17] px-4 py-2 text-sm font-semibold text-[#fff5ec] shadow-[0_14px_24px_rgba(42,30,20,0.18)] transition hover:translate-y-[-1px]"
                >
                  {t('shell.inspiration.page.useNow')}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
