import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>SmartPay Assistant</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Total Balance</Text>
        <Text style={styles.amount}>$12,450.00</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Upcoming Bills</Text>
        <Text>Amex Gold - Jun 15</Text>
        <Text>Chase Sapphire - Jun 20</Text>
        <Text>Internet - Jun 25</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Monthly Spending</Text>
        <Text>Food: $650</Text>
        <Text>Travel: $300</Text>
        <Text>Shopping: $450</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recommended Card</Text>
        <Text>For Dining → Use Amex Gold (4x Rewards)</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F5F5F5",
  },
  header: {
    fontSize: 32,
    fontWeight: "bold",
    marginTop: 30,
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  amount: {
    fontSize: 28,
    fontWeight: "bold",
    color: "green",
  },
});
