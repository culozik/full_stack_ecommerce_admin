"use client";

import axios from "axios";
import { useState } from "react";
import { Trash } from "lucide-react";
import { Category } from "@prisma/client";
import { toast } from "react-hot-toast";
import { useForm } from "react-hook-form";
import { useParams, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import {
	Form,
	FormItem,
	FormLabel,
	FormField,
	FormControl,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { AlertModal } from "@/components/modals/alert-modal";

import { formSchema } from "@/schemas/categoryFormSchema";

import type { CategoryFormValues } from "@/schemas/categoryFormSchema";

interface CategoryFormProps {
	initialData: Category | null;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({ initialData }) => {
	const params = useParams();
	const router = useRouter();

	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);

	const title = initialData ? "Edit category" : "Create category";
	const description = initialData ? "Edit a category" : "Create a new category";
	const toastMessage = initialData ? "Category updated." : "Category created.";
	const action = initialData ? "Save changes" : "Create";

	const form = useForm<CategoryFormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: initialData || {
			name: "",
			billboardId: "",
		},
	});

	const onSubmit = async (data: CategoryFormValues) => {
		try {
			setLoading(true);
			if (initialData) {
				await axios.patch(
					`/api/${params.storeId}/billboards/${params.billboardId}`,
					data
				);
			} else {
				await axios.post(`/api/${params.storeId}/billboards`, data);
			}

			router.refresh();
			router.push(`/${params.storeId}/billboards`);
			toast.success(toastMessage);
		} catch (err) {
			toast.error("Something went wrong.");
		} finally {
			setLoading(false);
		}
	};

	const onDelete = async () => {
		try {
			setLoading(true);

			await axios.delete(
				`/api/${params.storeId}/billboards/${params.billboardId}`
			);
			router.refresh();
			router.push(`/${params.storeId}/billboards`);
			toast.success("Billboard deleted.");
		} catch (err) {
			toast.error(
				"Make sure you removed all categories using this billboard first."
			);
		} finally {
			setLoading(false);
			setOpen(false);
		}
	};

	// -- Handle modal state --
	const handleModalOpen = () => {
		setOpen(true);
	};
	const handleClose = () => {
		setOpen(false);
	};

	return (
		<>
			<AlertModal
				isOpen={open}
				loading={loading}
				onClose={handleClose}
				onConfirm={onDelete}
			/>
			<div className="flex items-center justify-between">
				<Heading title={title} description={description} />
				{initialData && (
					<Button
						disabled={loading}
						variant="destructive"
						size="icon"
						onClick={handleModalOpen}
					>
						<Trash className="h-4 w-4" />
					</Button>
				)}
			</div>
			<Separator />
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="space-y-8 w-full"
				>
					<div className="grid grid-cols-3 gap-8">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input
											disabled={loading}
											placeholder="Category name"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="billboardId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Billboard</FormLabel>
									<Select
										disabled={loading}
										onValueChange={field.onChange}
										value={field.value}
										defaultValue={field.value}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue
													defaultValue={field.value}
													placeholder="Select a billboard"
												/>
											</SelectTrigger>
										</FormControl>
										<SelectContent></SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
					<Button disabled={loading} className="ml-auto" type="submit">
						{action}
					</Button>
				</form>
			</Form>
		</>
	);
};