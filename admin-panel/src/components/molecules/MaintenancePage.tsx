"use client";

import { useEffect, useState } from "react";
import styles from "./Maintenance.module.css";
import Image from "next/image";

interface MaintenanceProps {
  logo: string;
  title: string;
  description: string;
  image: string;
  endDate: any; // Keep it string from the server
}

const MaintenancePage = ({
  logo,
  title,
  description,
  image,
  endDate,
}: MaintenanceProps) => {
  const [countdown, setCountdown] = useState({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
  });

  const [hasMounted, setHasMounted] = useState(false); // 👈 hydration flag

  useEffect(() => {
    setHasMounted(true); // 👈 set flag true after mount
  }, []);

  useEffect(() => {
    if (!hasMounted) return; // Avoid running countdown on SSR

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(endDate).getTime();
      const distance = end - now;
      if (distance < 0) return clearInterval(interval);

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setCountdown({
        days: String(days).padStart(2, "0"),
        hours: String(hours).padStart(2, "0"),
        minutes: String(minutes).padStart(2, "0"),
        seconds: String(seconds).padStart(2, "0"),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [endDate, hasMounted]);

  return (
    <div className={styles.container}>
      <Image
        src={logo}
        alt="Logo"
        className={styles.logo}
        width={160}
        height={54}
        priority
      />
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.description}>{description}</p>

      {hasMounted && ( // 👈 only render countdown on client
        <div className={styles.countdownWrapper}>
          {Object.entries(countdown).map(([label, value]) => (
            <div key={label} className={styles.countdownCard}>
              <div className={styles.countdownValue}>{value}</div>
              <div className={styles.countdownLabel}>{label}</div>
            </div>
          ))}
        </div>
      )}

      <div>
        <Image
          src={image}
          alt="Maintenance"
          className={styles.maintenanceImage}
          width={800}
          height={400}
          priority
        />
      </div>
    </div>
  );
};

export default MaintenancePage;
