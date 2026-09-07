export interface Account {
    id: number;
    name: string;
    balance: string;
}

export interface Transaction {
    id: number;
    amount: string;
    created_at: string;
    origin_name: string | null;
    dest_name: string | null;
}

export interface UserProfile {
    email: string;
    fire_target: string;
}