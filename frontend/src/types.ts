export interface Account {
    id: number;
    nombre: string;
    balance: string;
    tipo_nombre?: string;
}

export interface AccountType {
    id: number;
    nombre: string;
}

export interface Transaction {
    id: number;
    amount: string;
    created_at: string;
    category: string | null;
    origin_name: string | null;
    dest_name: string | null;
    description: string | null;
    is_cleared: number;
    payment_period: string | null;
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