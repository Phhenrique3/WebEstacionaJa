import styles from "./DashboardStatCard.module.css";

type DashboardStatCardProps = {
    title: string;
    value: number | string;
};

export function DashboardStatCard({
    title,
    value,
}: DashboardStatCardProps) {
    return (
        <div className={styles.card}>
            <span>{title}</span>
            <strong>{value}</strong>
        </div>
    );
}