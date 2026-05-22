import { useEffect } from "react";
import { Text, View } from "react-native";
import { api } from "@/services/api";

export default function Home() {
  useEffect(() => {
    async function testApi() {
      try {
        const response = await api.get("auth/health");

        console.log("API OK:", response.data);
      } catch (error) {
        console.log("ERRO API:", error);
      }
    }

    testApi();
  }, []);

  return (
    <View>
      <Text>Teste API</Text>
    </View>
  );
}