
export type Wrappalyzer = Technology[]

export interface Technology {
    name: string
    description: string
    slug: string
    categories: Category[]
    confidence: number
    version: string
    icon: string
    website: string
    pricing: any[]
    cpe?: string
}

export interface Category {
    id: number
    slug: string
    groups: number[]
    name: string
    priority: number
}
