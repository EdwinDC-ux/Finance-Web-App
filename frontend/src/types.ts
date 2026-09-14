export interface Account {
    id: number;
    nombre: string;
    balance: string;
}

export interface Transaction {
    id: number;
    amount: string;
    created_at: string;
    category: string | null;
    origin_name: string | null;
    dest_name: string | null;
}

export interface Group {
    id: number;
    nombre: string;
}

export interface Category {
    id: number;
    name: string;
    type: string;
}

export interface UserProfile {
    email: string;
    fire_target: string;
}

export interface BudgetStat {
    id: number;
    name: string;
    budget_limit: string;
    spent: string;
}