"use client";

import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { format, parseISO } from "date-fns";
import { uk } from "date-fns/locale";
import {
  METERED_KINDS,
  UTILITY_LABELS,
  type UtilityKind,
  type RentMonth,
} from "@/types/rental";

Font.register({
  family: "Roboto",
  fonts: [
    { src: "/fonts/Roboto-Regular.ttf", fontWeight: 400 },
    { src: "/fonts/Roboto-Bold.ttf", fontWeight: 700 },
  ],
});

const TINT: Record<UtilityKind, string> = {
  gas: "#d97757",
  cold_water_bathroom: "#5a8db5",
  cold_water_kitchen: "#3f7da3",
  electricity: "#d99845",
  internet: "#7a8aa3",
  rent: "#8aa17a",
};

const BRAND = "#6f4a26";
const INK = "#1a1a1a";
const MUTED = "#6b6b6b";
const HAIRLINE = "#e6e6e6";
const SOFT_BG = "#f5f5f3";

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontFamily: "Roboto",
    fontSize: 11,
    color: INK,
    backgroundColor: "#ffffff",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    color: INK,
    letterSpacing: 0.2,
  },
  dateBlock: {
    alignItems: "flex-end",
  },
  dateLabel: {
    fontSize: 8,
    color: MUTED,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  dateValue: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: 700,
    color: INK,
  },

  divider: {
    height: 1,
    backgroundColor: HAIRLINE,
    marginTop: 4,
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 9,
    fontWeight: 700,
    color: MUTED,
    letterSpacing: 1.6,
    textTransform: "uppercase",
    marginTop: 4,
    marginBottom: 8,
  },

  readingsList: {
    backgroundColor: SOFT_BG,
    borderRadius: 8,
    padding: 4,
    marginBottom: 18,
  },
  readingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  readingRowAlt: {
    backgroundColor: "#ffffff",
  },
  colorChip: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  readingLabel: {
    width: 110,
    fontSize: 11,
    fontWeight: 700,
    color: INK,
  },
  readingValueText: {
    flex: 1,
    fontSize: 11,
    color: MUTED,
    textAlign: "right",
  },
  readingNumber: {
    fontWeight: 700,
    color: INK,
  },
  readingCurrent: {
    fontWeight: 700,
    color: BRAND,
  },

  photosGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
    marginTop: 10,
  },
  photoCell: {
    width: "50%",
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  photoLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  photoLabel: {
    fontSize: 9,
    fontWeight: 700,
    color: INK,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  photo: {
    width: "100%",
    height: 215,
    objectFit: "cover",
    borderRadius: 6,
  },
  photoEmpty: {
    width: "100%",
    height: 215,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  photoEmptyText: {
    fontSize: 9,
    color: MUTED,
  },

  footer: {
    position: "absolute",
    bottom: 20,
    left: 36,
    right: 36,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: MUTED,
  },
});

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const formatNumber = (n: number) =>
  n.toLocaleString("uk-UA", { maximumFractionDigits: 1 });

export function MonthReportDocument({ month }: { month: RentMonth }) {
  const monthLabel = capitalize(
    format(parseISO(`${month.month}-01`), "LLLL yyyy", { locale: uk }),
  );
  const reportDate = format(new Date(), "dd.MM.yyyy", { locale: uk });

  return (
    <Document title={`Звіт за ${monthLabel}`} author="Budget for Two">
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Звіт за {monthLabel}</Text>
          <View style={styles.dateBlock}>
            <Text style={styles.dateLabel}>Сформовано</Text>
            <Text style={styles.dateValue}>{reportDate}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Показники лічильників</Text>
        <View style={styles.readingsList}>
          {METERED_KINDS.map((kind, idx) => {
            const reading = month.readings.find((r) => r.kind === kind);
            const prev = reading?.previous ?? 0;
            const curr = reading?.current ?? 0;
            const diff = curr - prev;
            const diffLabel =
              diff > 0
                ? `+${formatNumber(diff)}`
                : diff < 0
                  ? `${formatNumber(diff)}`
                  : "0";
            return (
              <View
                key={kind}
                style={[
                  styles.readingRow,
                  idx % 2 === 1 ? styles.readingRowAlt : {},
                ]}
              >
                <View
                  style={[styles.colorChip, { backgroundColor: TINT[kind] }]}
                />
                <Text style={styles.readingLabel}>{UTILITY_LABELS[kind]}</Text>
                <Text style={styles.readingValueText}>
                  Було{" "}
                  <Text style={styles.readingNumber}>{formatNumber(prev)}</Text>
                  {"  →  "}
                  стало:{" "}
                  <Text style={styles.readingCurrent}>
                    {formatNumber(curr)}
                  </Text>
                  {"  "}({diffLabel})
                </Text>
              </View>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Фото лічильників</Text>
        <View style={styles.photosGrid}>
          {METERED_KINDS.map((kind) => {
            const reading = month.readings.find((r) => r.kind === kind);
            return (
              <View key={kind} style={styles.photoCell} wrap={false}>
                <View style={styles.photoLabelRow}>
                  <View
                    style={[styles.colorChip, { backgroundColor: TINT[kind] }]}
                  />
                  <Text style={styles.photoLabel}>{UTILITY_LABELS[kind]}</Text>
                </View>
                {reading?.photo ? (
                  <Image src={reading.photo} style={styles.photo} />
                ) : (
                  <View style={styles.photoEmpty}>
                    <Text style={styles.photoEmptyText}>Без фото</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <View style={styles.footer} fixed>
          <Text>Budget for Two</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
