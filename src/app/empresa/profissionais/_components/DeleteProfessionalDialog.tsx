"use client";

import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Professional } from "../types";

type DeleteProfessionalDialogProps = {
  professional: Professional | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export function DeleteProfessionalDialog({
  professional,
  onOpenChange,
  onConfirm,
}: DeleteProfessionalDialogProps) {
  return (
    <AlertDialog open={Boolean(professional)} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="mb-2 grid h-10 w-10 place-items-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <AlertDialogTitle>Remover profissional?</AlertDialogTitle>
          <AlertDialogDescription>
            {professional
              ? `Você está removendo ${professional.name}. Esta ação não remove agendamentos antigos, mas o profissional não aparecerá mais na lista.`
              : "Esta ação não poderá ser desfeita."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant="destructive" onClick={onConfirm}>
              Remover
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

