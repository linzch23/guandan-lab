import type { CardBlock, CardCode } from "../content/schema";

const suitSymbols = { S: "♠", H: "♥", C: "♣", D: "♦" } as const;
const suitNames = { S: "黑桃", H: "红桃", C: "梅花", D: "方块" } as const;

export function PlayingCard({ code, levelRank }: { code: CardCode; levelRank?: string }) {
  if (code === "BJ" || code === "RJ") {
    const big = code === "RJ";
    return <span className={`playing-card joker ${big ? "red" : "black"}`} aria-label={big ? "大王" : "小王"}><span>J</span><strong>{big ? "大" : "小"}</strong></span>;
  }
  const [suit, rank] = code.split("-") as [keyof typeof suitSymbols, string];
  const red = suit === "H" || suit === "D";
  const wild = suit === "H" && rank === levelRank;
  return <span className={`playing-card ${red ? "red" : "black"} ${wild ? "wild" : ""}`} aria-label={`${suitNames[suit]}${rank}${wild ? "，逢人配" : ""}`}><strong>{rank}</strong><span>{suitSymbols[suit]}</span>{wild && <i>配</i>}</span>;
}

export function CardGroup({ cards, label, levelRank }: { cards: CardCode[]; label?: string; levelRank?: string }) {
  return <div className="card-group"><div className="card-row">{cards.map((card, index) => <PlayingCard code={card} levelRank={levelRank} key={`${card}-${index}`} />)}</div>{label && <span className="card-group-label">{label}</span>}</div>;
}

export function CardExample({ block }: { block: CardBlock }) {
  return <figure className="card-example"><figcaption>{block.title}{block.levelRank ? <span>当前打 {block.levelRank}</span> : null}</figcaption><div className="card-example-groups">{block.groups.map((group) => <CardGroup key={group.label} cards={group.cards} label={group.label} levelRank={block.levelRank} />)}</div></figure>;
}
