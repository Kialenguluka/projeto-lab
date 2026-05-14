import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, output, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Address, AddressService } from '../../core/services/address.service';

export interface CheckoutResult {
  addressId: number;
  paymentMethod: string;
}

@Component({
  selector: 'app-checkout-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full mx-4 overflow-hidden animate-in fade-in zoom-in duration-300">
        <!-- Header -->
        <div class="p-6 border-b dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
          <h2 class="text-xl font-bold dark:text-white">{{ showSummary ? 'Confirmação de Operação' : 'Finalizar Encomenda' }}</h2>
          <button (click)="onCancel()" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <div class="flex flex-col lg:flex-row max-h-[80vh]">
          <!-- Left: Form or Summary -->
          <div class="flex-1 p-6 overflow-y-auto custom-scrollbar border-r dark:border-gray-800">
            @if (!showSummary) {
              <!-- Step 1: Endereço -->
              <div class="mb-8 animate-in slide-in-from-left-4 duration-300">
                <div class="flex items-center gap-2 mb-4">
                  <span class="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">1</span>
                  <h3 class="font-bold dark:text-gray-200">Local de Entrega</h3>
                </div>
                
                <div class="space-y-3 mb-6">
                  @for (addr of addresses; track addr.id) {
                    <label [class]="'relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ' + 
                                    (selectedAddressId === addr.id ? 'border-primary bg-primary/5' : 'border-gray-100 dark:border-gray-800')">
                      <input type="radio" [value]="addr.id" [(ngModel)]="selectedAddressId" class="mr-4 accent-primary" />
                      <div class="flex-1">
                        <p class="font-semibold text-sm dark:text-white">{{ addr.street }}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">{{ addr.province }}, {{ addr.city }}</p>
                      </div>
                    </label>
                  }
                  
                  <label [class]="'flex items-center p-4 border-2 rounded-xl cursor-pointer border-dashed transition-all ' + 
                                  (selectedAddressId === 0 ? 'border-primary bg-primary/5' : 'border-gray-100 dark:border-gray-800')">
                    <input type="radio" [value]="0" [(ngModel)]="selectedAddressId" class="mr-4 accent-primary" />
                    <span class="text-sm font-bold text-primary">Novo Endereço (Preencher em baixo)</span>
                  </label>
                </div>

                <!-- New Address Form -->
                <div *ngIf="selectedAddressId === 0" class="animate-in slide-in-from-top-2 duration-300 space-y-4 p-5 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border dark:border-gray-700">
                  <div>
                    <label class="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1 block">Província</label>
                    <select [(ngModel)]="newAddress.province" class="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none">
                      @for (p of provinces; track p) {
                        <option [value]="p">{{ p }}</option>
                      }
                    </select>
                  </div>
                  <div>
                    <label class="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1 block">Município / Cidade</label>
                    <input type="text" [(ngModel)]="newAddress.city" placeholder="Ex: Talatona, Maianga..." class="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none" />
                  </div>
                  <div>
                    <label class="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1 block">Rua e Ponto de Referência</label>
                    <textarea [(ngModel)]="newAddress.street" rows="2" placeholder="Ex: Rua Direita da Samba, junto ao ISPTEC" class="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none resize-none"></textarea>
                  </div>
                </div>
              </div>

              <!-- Step 2: Pagamento -->
              <div class="animate-in slide-in-from-left-4 duration-500 delay-150">
                <div class="flex items-center gap-2 mb-4">
                  <span class="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">2</span>
                  <h3 class="font-bold dark:text-gray-200">Pagamento</h3>
                </div>
                <div class="flex gap-2 mb-6">
                  @for (method of ['card', 'transfer', 'cash']; track method) {
                    <button (click)="paymentMethod = method" 
                            [class]="'flex-1 p-4 border-2 rounded-xl text-center transition-all duration-200 ' + 
                                    (paymentMethod === method 
                                      ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10 scale-[1.02]' 
                                      : 'border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-400')">
                      <div class="flex flex-col items-center gap-2">
                        <span [class]="paymentMethod === method ? 'text-primary' : ''">
                          @if (method === 'card') {
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                          } @else if (method === 'transfer') {
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 19 7-7 3 3-7 7-3-3Z"/><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5Z"/><path d="m2 2 20 20"/></svg>
                          } @else {
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>
                          }
                        </span>
                        <span class="text-xs font-bold" [class.text-primary]="paymentMethod === method">{{ paymentMethodLabel(method) }}</span>
                      </div>
                    </button>
                  }
                </div>

                <!-- Realistic Payment Forms -->
                <div class="p-5 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border dark:border-gray-700 animate-in slide-in-from-top-2">
                  @if (paymentMethod === 'card') {
                    <div class="space-y-4">
                      <div>
                        <label class="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1 block">Número do Cartão (Multicaixa)</label>
                        <input type="text" [(ngModel)]="paymentDetails.cardNumber" placeholder="5061 XXXX XXXX XXXX" class="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none" />
                      </div>
                      <div class="flex gap-4">
                        <div class="flex-1">
                          <label class="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1 block">Expiração</label>
                          <input type="text" [(ngModel)]="paymentDetails.expiry" placeholder="MM/YY" class="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none" />
                        </div>
                        <div class="flex-1">
                          <label class="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1 block">CVV</label>
                          <input type="text" [(ngModel)]="paymentDetails.cvv" placeholder="XXX" class="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none" />
                        </div>
                      </div>
                    </div>
                  } @else if (paymentMethod === 'transfer') {
                    <div class="space-y-4">
                      <div class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-[10px] text-blue-700 dark:text-blue-300">
                        <strong>IBAN Ministore:</strong> AO06 0000 0000 0000 0000 0000 0
                      </div>
                      <div>
                        <label class="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1 block">Nº de Operação / Comprovativo</label>
                        <input type="text" [(ngModel)]="paymentDetails.reference" placeholder="Ex: MCX-99228811" class="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none" />
                      </div>
                    </div>
                  } @else {
                    <div class="text-center py-4">
                      <p class="text-xs text-gray-500">Pague no acto da entrega ao estafeta.</p>
                    </div>
                  }
                </div>
              </div>

            } @else {
              <!-- ATM STYLE CONFIRMATION -->
              <div class="animate-in zoom-in duration-300 p-4">
                <div class="bg-gray-100 dark:bg-gray-800 rounded-xl p-8 border-2 border-primary/20 shadow-inner max-w-md mx-auto font-mono">
                  <div class="text-center mb-6 border-b border-gray-300 dark:border-gray-700 pb-4">
                    <h4 class="text-lg font-black tracking-tighter text-primary">MINISTORE AO</h4>
                    <p class="text-[10px] text-gray-500 uppercase">Resumo da Operação</p>
                  </div>
                  
                  <div class="space-y-4 text-sm">
                    <div class="flex justify-between">
                      <span class="text-gray-500 uppercase text-[10px]">Operação:</span>
                      <span class="font-bold dark:text-white">PAGAMENTO SERVIÇOS</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-500 uppercase text-[10px]">Método:</span>
                      <span class="font-bold dark:text-white">{{ paymentMethodLabel(paymentMethod) | uppercase }}</span>
                    </div>
                    <div class="pt-4 border-t border-dashed border-gray-300 dark:border-gray-700">
                      <span class="text-gray-500 uppercase text-[10px] block mb-1">Destino / Entrega:</span>
                      <p class="text-xs font-bold dark:text-white leading-tight">
                        {{ getSelectedAddress()?.street }}<br>
                        {{ getSelectedAddress()?.province }}, {{ getSelectedAddress()?.city }}
                      </p>
                    </div>
                    
                    <div class="pt-8 border-t-2 border-gray-900 dark:border-white">
                      <div class="flex justify-between items-baseline">
                        <span class="text-lg font-black dark:text-white">TOTAL A PAGAR</span>
                        <span class="text-2xl font-black text-primary">Kz {{ totalAmount() | number:'1.2-2' }}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="mt-8 pt-4 border-t border-gray-300 dark:border-gray-700 text-center">
                    <p class="text-[9px] text-gray-400 italic">Deseja confirmar o débito deste valor?</p>
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Right: Visual Feedback / ATM Sidebar -->
          <div class="hidden lg:flex w-80 bg-gray-50 dark:bg-gray-800/30 flex-col items-center justify-center p-8 text-center">
            @if (!showSummary) {
              <div class="space-y-6">
                <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
                </div>
                <div>
                  <h4 class="font-bold dark:text-white">Quase lá!</h4>
                  <p class="text-xs text-gray-500 mt-2">Preencha os dados à esquerda para avançar para a confirmação segura.</p>
                </div>
              </div>
            } @else {
              <div class="space-y-6">
                <div class="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto text-green-500 animate-bounce">
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg>
                </div>
                <div>
                  <h4 class="font-bold dark:text-white">Confirmação ATM</h4>
                  <p class="text-xs text-gray-500 mt-2">Esta operação será processada de forma segura pelo gateway da MiniStore AO.</p>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Footer -->
        <div class="p-6 bg-gray-50 dark:bg-gray-800/50 border-t dark:border-gray-800 flex gap-3 justify-end items-center">
          @if (!showSummary) {
            <button (click)="onCancel()" class="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400">Cancelar</button>
            <button
              (click)="showSummary = true"
              [disabled]="isLoading || (selectedAddressId === 0 && !isNewAddressValid()) || selectedAddressId === null || !isPaymentValid()"
              class="px-8 py-2.5 bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.05] active:scale-95 transition-all disabled:opacity-50">
              Continuar
            </button>

          } @else {
            <button (click)="showSummary = false" class="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400">Voltar</button>
            <button
              (click)="onConfirm()"
              [disabled]="isLoading"
              class="px-10 py-3 bg-green-600 text-white text-sm font-black rounded-xl shadow-lg shadow-green-600/20 hover:scale-[1.05] active:scale-95 transition-all">
              {{ isLoading ? 'A PROCESSAR...' : 'CONFIRMAR PAGAMENTO' }}
            </button>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
    .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; }
  `]
})
export class CheckoutModalComponent implements OnInit {
  private readonly addressService = inject(AddressService);

  addresses: Address[] = [];
  selectedAddressId: number | null = null;
  paymentMethod: string = 'card';
  paymentDetails = { cardNumber: '', expiry: '', cvv: '', reference: '' };
  newAddress: Address = { street: '', city: '', province: 'Luanda', postal_code: '0000' };
  isLoading = false;
  showSummary = false;
  totalAmount = input<number>(0);
  confirmed = output<CheckoutResult>();
  cancelled = output<void>();

  ngOnInit(): void {
    this.loadAddresses();
  }

  isPaymentValid(): boolean {
    if (this.paymentMethod === 'card') {
      return this.paymentDetails.cardNumber.length >= 16 && 
             this.paymentDetails.expiry.length >= 4 && 
             this.paymentDetails.cvv.length >= 3;
    }
    if (this.paymentMethod === 'transfer') {
      return this.paymentDetails.reference.length >= 5;
    }
    return true; // Cash is always valid
  }


  private loadAddresses(): void {
    this.addressService.getAddresses().subscribe({
      next: (addresses) => {
        this.addresses = addresses;
        if (addresses.length > 0) {
          this.selectedAddressId = addresses[0].id || null;
        }
      },
    });
  }

  getSelectedAddress(): Address | undefined {
    if (this.selectedAddressId === 0) return this.newAddress;
    return this.addresses.find(a => a.id === this.selectedAddressId);
  }

  isNewAddressValid(): boolean {
    return this.newAddress.street.trim().length > 5 &&
           this.newAddress.city.trim().length > 2 &&
           !!this.newAddress.province;
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  paymentMethodLabel(m: string): string {
    const labels: any = { card: 'Cartão', transfer: 'TPA / Transf.', cash: 'Numerário' };
    return labels[m] || m;
  }

  readonly provinces = [
    'Luanda', 'Benguela', 'Huambo', 'Huíla', 'Cabinda', 'Namibe', 
    'Malanje', 'Zaire', 'Uíge', 'Lunda Norte', 'Lunda Sul', 'Moxico', 
    'Cuando Cubango', 'Cunene', 'Bié', 'Cuanza Norte', 'Cuanza Sul', 'Bengo'
  ];

  onConfirm(): void {
    const paymentMethod = this.paymentMethod;

    if (this.selectedAddressId && this.selectedAddressId > 0) {
      this.confirmed.emit({ addressId: this.selectedAddressId, paymentMethod });
    } else if (this.selectedAddressId === 0 && this.isNewAddressValid()) {
      this.isLoading = true;
      this.addressService.addAddress(this.newAddress).subscribe({
        next: (address) => {
          this.isLoading = false;
          this.confirmed.emit({ addressId: address.id || 0, paymentMethod });
        },
        error: () => {
          this.isLoading = false;
          alert('Erro ao criar endereço');
        },
      });
    }
  }
}


