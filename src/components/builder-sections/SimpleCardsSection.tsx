/**
 * Simple Cards Section - Grid of simple cards with title and description
 */

interface Card {
  title: string;
  description: string;
}

interface SimpleCardsSectionProps {
  title: string;
  description: string;
  cards: Card[];
  columns?: 2 | 3 | 4;
  backgroundColor?: string;
  textColor?: string;
}

export default function SimpleCardsSection({
  title,
  description,
  cards,
  columns = 4,
  backgroundColor = 'bg-slate-50 dark:bg-slate-900',
  textColor = 'text-slate-900 dark:text-white'
}: SimpleCardsSectionProps) {
  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 xl:grid-cols-4'
  };

  return (
    <section className={`${backgroundColor} ${textColor} py-16`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{description}</p>
        </div>
        
        <div className={`grid ${gridCols[columns]} gap-6`}>
          {cards.map((card, index) => (
            <div 
              key={index}
              className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 hover:-translate-y-1 transition-transform shadow-sm hover:shadow-lg"
            >
              <h3 className="font-semibold mb-3">{card.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">{card.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
