export interface Account {
    id: number;
    name: string;
    balance: string;
}

export interface Category {
    id: number;
    name: string;
    type: string;
}

export interface Transaction {
    id: number;
    amount: string;
    created_at: string;
    category: string | null; // NUEVO
    origin_name: string | null;
    dest_name: string | null;
}

export interface UserProfile {
    email: string;
    fire_target: string;
}