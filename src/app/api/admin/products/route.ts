import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { parseJsonBody } from '@/lib/json'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET all products
export async function GET(request: NextRequest) {
    try {
        const products = await prisma.product.findMany({
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(products)
    } catch (error: any) {
        console.error('Error fetching products:', error)
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
    }
}

// POST create new product (Admin only)
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const data = await parseJsonBody<{
            name: string
            description?: string
            price: string | number
            imageUrl?: string
            category?: string
            inStock?: boolean
            stockCount?: string | number
        }>(request)

        const product = await prisma.product.create({
            data: {
                name: data.name,
                description: data.description,
                price: Number(data.price),
                imageUrl: data.imageUrl,
                category: data.category,
                inStock: data.inStock ?? true,
                stockCount: Number(data.stockCount) || 0
            }
        })

        return NextResponse.json(product)
    } catch (error: any) {
        console.error('Error creating product:', error)
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
    }
}

// PUT update product (Admin only)
export async function PUT(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const data = await parseJsonBody<{
            id: string
            name?: string
            description?: string
            price?: string | number
            imageUrl?: string
            category?: string
            inStock?: boolean
            stockCount?: string | number
        }>(request)
        const { id, ...updateData } = data

        const product = await prisma.product.update({
            where: { id },
            data: {
                ...updateData,
                price: updateData.price ? Number(updateData.price) : undefined,
                stockCount: updateData.stockCount ? Number(updateData.stockCount) : undefined
            }
        })

        return NextResponse.json(product)
    } catch (error: any) {
        console.error('Error updating product:', error)
        return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
    }
}

// DELETE product (Admin only)
export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
        }

        await prisma.product.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Error deleting product:', error)
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
    }
}
