import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { useForm, router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Card, CardContent } from '@/Components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/Components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Plus, Pencil, Trash2 } from 'lucide-react';

function ProductForm({ product, categories, onClose }) {
    const isEdit = !!product;
    const { data, setData, post, put, processing, errors } = useForm({
        name: product?.name || '',
        description: product?.description || '',
        price: product?.price || '',
        category: product?.category || '',
        unit: product?.unit || '',
        stock: product?.stock ?? 0,
        is_active: product?.is_active ?? true,
        is_featured: product?.is_featured ?? false,
        image: null,
    });

    function submit(e) {
        e.preventDefault();
        const options = { onSuccess: onClose, forceFormData: true };
        if (isEdit) put(`/admin/products/${product.id}`, options);
        else post('/admin/products', options);
    }

    return (
        <form onSubmit={submit} className="space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1 col-span-2">
                    <Label>Name</Label>
                    <Input value={data.name} onChange={e => setData('name', e.target.value)} />
                    {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                </div>
                <div className="space-y-1">
                    <Label>Price (₱)</Label>
                    <Input type="number" step="0.01" value={data.price} onChange={e => setData('price', e.target.value)} />
                    {errors.price && <p className="text-xs text-red-500">{errors.price}</p>}
                </div>
                <div className="space-y-1">
                    <Label>Stock</Label>
                    <Input type="number" value={data.stock} onChange={e => setData('stock', e.target.value)} />
                </div>
                <div className="space-y-1">
                    <Label>Unit</Label>
                    <Input value={data.unit} onChange={e => setData('unit', e.target.value)} placeholder="kg / bundle" />
                </div>
                <div className="space-y-1">
                    <Label>Category</Label>
                    <Select value={data.category} onValueChange={v => setData('category', v)}>
                        <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                        <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                    {errors.category && <p className="text-xs text-red-500">{errors.category}</p>}
                </div>
                <div className="space-y-1 col-span-2">
                    <Label>Description</Label>
                    <Input value={data.description} onChange={e => setData('description', e.target.value)} />
                </div>
                <div className="space-y-1 col-span-2">
                    <Label>Image</Label>
                    <Input type="file" accept="image/*" onChange={e => setData('image', e.target.files[0])} />
                </div>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} />
                    Active
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={data.is_featured} onChange={e => setData('is_featured', e.target.checked)} />
                    Featured
                </label>
            </div>
            <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={processing}>{processing ? 'Saving…' : isEdit ? 'Update' : 'Create'}</Button>
                <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            </div>
        </form>
    );
}

export default function Products({ products, categories }) {
    const [editProduct, setEditProduct] = useState(null);
    const [createOpen, setCreateOpen] = useState(false);

    function destroy(id) {
        if (confirm('Delete this product?')) router.delete(`/admin/products/${id}`);
    }

    return (
        <AppLayout title="Products">
            <div className="space-y-4">
                <div className="flex justify-end">
                    <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                        <DialogTrigger asChild>
                            <Button><Plus className="h-4 w-4 mr-1" />Add Product</Button>
                        </DialogTrigger>
                        <DialogContent className="max-h-[90vh] overflow-y-auto">
                            <DialogHeader><DialogTitle>New Product</DialogTitle></DialogHeader>
                            <ProductForm categories={categories} onClose={() => setCreateOpen(false)} />
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map(product => (
                        <Card key={product.id} className={!product.is_active ? 'opacity-60' : ''}>
                            <CardContent className="p-4 space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1">
                                        <p className="text-xs text-[#E8622A] font-medium">{product.category}</p>
                                        <p className="font-semibold text-sm text-[#1A100A]">{product.name}</p>
                                        <p className="text-sm text-[#E8622A] font-bold">₱{Number(product.price).toFixed(2)} / {product.unit}</p>
                                        <p className="text-xs text-gray-400">Stock: {product.stock} {!product.is_active && '• Inactive'} {product.is_featured && '• Featured'}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Dialog open={editProduct?.id === product.id} onOpenChange={open => !open && setEditProduct(null)}>
                                        <DialogTrigger asChild>
                                            <Button size="sm" variant="outline" onClick={() => setEditProduct(product)}>
                                                <Pencil className="h-3 w-3 mr-1" />Edit
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-h-[90vh] overflow-y-auto">
                                            <DialogHeader><DialogTitle>Edit Product</DialogTitle></DialogHeader>
                                            <ProductForm product={editProduct} categories={categories} onClose={() => setEditProduct(null)} />
                                        </DialogContent>
                                    </Dialog>
                                    <Button size="sm" variant="destructive" onClick={() => destroy(product.id)}>
                                        <Trash2 className="h-3 w-3 mr-1" />Delete
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                {products.length === 0 && <div className="text-center py-16 text-gray-500">No products yet.</div>}
            </div>
        </AppLayout>
    );
}
