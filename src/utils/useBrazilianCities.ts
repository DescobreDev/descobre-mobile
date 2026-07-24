import { useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CityOption {
  id: number;
  city: string;
  uf: string; // sigla, ex: "SP"
  stateName: string; // ex: "São Paulo"
  label: string; // "Itapetininga - São Paulo"
  searchKey: string; // versão normalizada (sem acento, minúscula) pra filtro
}

const CACHE_KEY = '@brazilian_cities_v1';
const IBGE_URL =
  'https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome';

function normalize(text: string) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

type IbgeMunicipio = {
  id: number;
  nome: string;
  microrregiao?: {
    mesorregiao?: {
      UF?: { sigla: string; nome: string };
    };
  };
  'regiao-imediata'?: {
    'regiao-intermediaria'?: {
      UF?: { sigla: string; nome: string };
    };
  };
};

function mapMunicipio(m: IbgeMunicipio): CityOption | null {
  const uf =
    m.microrregiao?.mesorregiao?.UF ??
    m['regiao-imediata']?.['regiao-intermediaria']?.UF;

  if (!uf) return null;

  const city = m.nome;
  const stateName = uf.nome;

  return {
    id: m.id,
    city,
    uf: uf.sigla,
    stateName,
    label: `${city} - ${stateName}`,
    searchKey: normalize(`${city} ${stateName} ${uf.sigla}`),
  };
}

/**
 * Busca (e cacheia em disco) a lista completa de municípios brasileiros
 * com estado, pra alimentar o autocomplete de localização.
 */
export function useBrazilianCities() {
  const [cities, setCities] = useState<CityOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    (async () => {
      try {
        const cached = await AsyncStorage.getItem(CACHE_KEY);

        if (cached) {
          setCities(JSON.parse(cached));
          setLoading(false);
          return;
        }

        const response = await fetch(IBGE_URL);

        if (!response.ok) {
          throw new Error(`IBGE respondeu ${response.status}`);
        }

        const raw: IbgeMunicipio[] = await response.json();

        const mapped = raw
          .map(mapMunicipio)
          .filter((c): c is CityOption => c !== null);

        setCities(mapped);

        AsyncStorage.setItem(CACHE_KEY, JSON.stringify(mapped)).catch(() => {
        });
      } catch (err) {
        console.error('Erro ao buscar municípios do IBGE:', err);
        setError('Não foi possível carregar a lista de cidades.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { cities, loading, error };
}