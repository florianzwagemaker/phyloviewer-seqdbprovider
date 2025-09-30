export interface TreeApiRequest {
  case_ids: string[];
  genetic_distance_case_type_col_id: string;
  tree_algorithm_code: string;
}

export interface TreeApiResponse {
  id: string | null;
  tree_algorithm_id: string | null;
  tree_algorithm: string | null;
  tree_algorithm_code: string;
  genetic_distance_protocol_id: string;
  genetic_distance_protocol: string | null;
  leaf_ids: string[];
  sequence_ids: string[] | null;
  newick_repr: string;
}