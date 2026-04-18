import { useState, useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { FaLeaf, FaCartPlus, FaTrash, FaSave, FaFilePdf, FaFolderOpen, FaShoppingCart } from 'react-icons/fa';
import { apiService, Product } from '../services/api';
import { showSuccessToast, showErrorToast } from './ToastNotification';
import EmptyState from './EmptyState';
import LoadingSkeleton from './LoadingSkeleton';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import './GroceryListPanel.css';

interface GroceryItem {
  localId: string;
  productId: number;
  productName: string;
  isOrganic: boolean;
  quantityKg: number;
  pricePerKg: number;
  isAnalysed: boolean;
  lineTotal: number;
}

const GroceryListPanel = () => {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [addIsOrganic, setAddIsOrganic] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [addKg, setAddKg] = useState('');
  const [addG, setAddG] = useState('');
  const [saveName, setSaveName] = useState('');
  const [saveModal, setSaveModal] = useState(false);
  const [loadModal, setLoadModal] = useState(false);
  const [loadedListId, setLoadedListId] = useState<number | null>(null);

  const queryClient = useQueryClient();

  const { data: searchResults = [], isFetching: searchFetching } = useQuery(
    ['product-search', searchQ],
    () => apiService.searchProducts(searchQ, 15),
    { enabled: searchQ.trim().length >= 2, staleTime: 30_000 }
  );

  const { data: savedLists = [], isLoading: listsLoading } = useQuery(
    'grocery-lists',
    () => apiService.getGroceryLists(),
    { enabled: loadModal || saveModal }
  );

  const totals = useMemo(() => {
    const organic = items.filter((i) => i.isOrganic);
    const nonOrganic = items.filter((i) => !i.isOrganic);
    return {
      organic: organic.reduce((s, i) => s + i.lineTotal, 0),
      nonOrganic: nonOrganic.reduce((s, i) => s + i.lineTotal, 0),
      grand: items.reduce((s, i) => s + i.lineTotal, 0),
      hasAnalysed: items.some((i) => i.isAnalysed),
    };
  }, [items]);

  const quantityKg = useMemo(() => {
    const kg = addKg ? Number(addKg) : 0;
    const g = addG ? Number(addG) : 0;
    return kg + g / 1000;
  }, [addKg, addG]);

  const addItem = useCallback(async () => {
    if (!selectedProduct) return;
    if (quantityKg <= 0) {
      showErrorToast('Please enter a quantity (kg and/or g)');
      return;
    }
    try {
      const { pricePerKg, isAnalysed } = await apiService.getGroceryPrice(
        selectedProduct.id,
        addIsOrganic
      );
      const lineTotal = Math.round(pricePerKg * quantityKg * 100) / 100;
      setItems((prev) => [
        ...prev,
        {
          localId: `id_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          productId: selectedProduct.id,
          productName: selectedProduct.name,
          isOrganic: addIsOrganic,
          quantityKg,
          pricePerKg,
          isAnalysed,
          lineTotal,
        },
      ]);
      setSelectedProduct(null);
      setAddKg('');
      setAddG('');
      showSuccessToast(`Added ${selectedProduct.name} to list`);
    } catch (e: unknown) {
      const msg = e && typeof e === 'object' && 'response' in e
        ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
        : 'Could not fetch price for this product';
      showErrorToast(msg || 'Failed to add item');
    }
  }, [selectedProduct, quantityKg, addIsOrganic]);

  const removeItem = (localId: string) => {
    setItems((prev) => prev.filter((i) => i.localId !== localId));
  };

  const clearList = () => {
    setItems([]);
    setLoadedListId(null);
    showSuccessToast('List cleared');
  };

  const openSave = () => {
    setSaveName(loadedListId ? '' : `Grocery ${new Date().toLocaleDateString()}`);
    setSaveModal(true);
  };

  const doSave = async () => {
    const name = saveName.trim() || `Grocery ${new Date().toISOString().slice(0, 10)}`;
    const payload = {
      name,
      items: items.map((i) => ({
        productId: i.productId,
        isOrganic: i.isOrganic,
        quantityKg: i.quantityKg,
        pricePerKg: i.pricePerKg,
        isAnalysed: i.isAnalysed,
      })),
    };
    try {
      if (loadedListId) {
        await apiService.updateGroceryList(loadedListId, payload);
        showSuccessToast('List updated');
      } else {
        const created = await apiService.createGroceryList(payload);
        setLoadedListId(created.id);
        showSuccessToast('List saved');
      }
      setSaveModal(false);
      queryClient.invalidateQueries('grocery-lists');
    } catch {
      showErrorToast('Failed to save list');
    }
  };

  const loadList = async (id: number) => {
    try {
      const list = await apiService.getGroceryList(id);
      setItems(
        list.items.map((it) => ({
          localId: `load_${it.id}_${Date.now()}`,
          productId: it.productId,
          productName: it.product?.name ?? `Product #${it.productId}`,
          isOrganic: it.isOrganic,
          quantityKg: Number(it.quantityKg),
          pricePerKg: Number(it.pricePerKg),
          isAnalysed: it.isAnalysed,
          lineTotal: Math.round(Number(it.quantityKg) * Number(it.pricePerKg) * 100) / 100,
        }))
      );
      setLoadedListId(list.id);
      setLoadModal(false);
      showSuccessToast(`Loaded "${list.name}"`);
    } catch {
      showErrorToast('Failed to load list');
    }
  };

  const exportPdf = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const marginX = 14;
    const nowLabel = new Date().toLocaleString();

    // Header bar
    doc.setFillColor(6, 182, 212);
    doc.rect(0, 0, pageWidth, 28, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Grocery List', marginX, 18);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.text(`Generated: ${nowLabel}`, marginX, 24);

    // Summary chips
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(marginX, 34, pageWidth - marginX * 2, 14, 3, 3, 'F');
    doc.setTextColor(30);
    doc.setFontSize(10);
    doc.text(`Items: ${items.length}`, marginX + 4, 43);
    doc.text(`Organic: ${items.filter((i) => i.isOrganic).length}`, marginX + 38, 43);
    doc.text(`Non-organic: ${items.filter((i) => !i.isOrganic).length}`, marginX + 82, 43);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total: Rs. ${totals.grand.toFixed(2)}`, pageWidth - marginX - 2, 43, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    const organicRows = items.filter((i) => i.isOrganic);
    const nonOrganicRows = items.filter((i) => !i.isOrganic);

    const buildRows = (list: GroceryItem[]) =>
      list.map((i) => [
        i.productName,
        i.isOrganic ? 'Organic' : 'Non-organic',
        `${Math.floor(i.quantityKg)} kg ${Math.round((i.quantityKg % 1) * 1000)} g`,
        `Rs. ${i.pricePerKg.toFixed(2)}`,
        i.isAnalysed ? 'Analysed' : '—',
        `Rs. ${i.lineTotal.toFixed(2)}`,
      ]);

    const allRows = [...buildRows(organicRows), ...buildRows(nonOrganicRows)];
    if (allRows.length > 0) {
      autoTable(doc, {
        startY: 52,
        head: [['Product', 'Type', 'Quantity', 'Price/kg', 'Note', 'Total (Rs.)']],
        body: allRows,
        theme: 'striped',
        styles: {
          fontSize: 10,
          cellPadding: 3.2,
          textColor: [30, 41, 59],
          lineColor: [226, 232, 240],
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: [79, 70, 229],
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        columnStyles: {
          0: { cellWidth: 46 },
          1: { cellWidth: 28 },
          2: { cellWidth: 26 },
          3: { cellWidth: 26 },
          4: { cellWidth: 20 },
          5: { cellWidth: 26, halign: 'right' },
        },
        margin: { left: marginX, right: marginX },
      });
    }

    let y = (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? 52;
    y += 8;
    // Totals box
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(marginX, y, pageWidth - marginX * 2, 26, 3, 3, 'F');
    doc.setTextColor(22);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    let totalsY = y + 8;
    if (organicRows.length > 0) {
      doc.text('Organic subtotal', marginX + 6, totalsY);
      doc.text(`Rs. ${organicRows.reduce((s, i) => s + i.lineTotal, 0).toFixed(2)}`, pageWidth - marginX - 6, totalsY, { align: 'right' });
      totalsY += 6;
    }
    if (nonOrganicRows.length > 0) {
      doc.text('Non-organic subtotal', marginX + 6, totalsY);
      doc.text(`Rs. ${nonOrganicRows.reduce((s, i) => s + i.lineTotal, 0).toFixed(2)}`, pageWidth - marginX - 6, totalsY, { align: 'right' });
      totalsY += 6;
    }
    doc.setFontSize(12);
    doc.text('Grand total', marginX + 6, totalsY + 1);
    doc.text(`Rs. ${totals.grand.toFixed(2)}`, pageWidth - marginX - 6, totalsY + 1, { align: 'right' });
    y += 32;

    if (totals.hasAnalysed) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(80);
      doc.text(
        'Note: Items marked "Analysed" are estimated from non-organic market prices with a 35% organic premium.',
        marginX,
        y + 4,
      );
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text('Vegetables & Fruits Price Analytics', marginX, 287);
    doc.save(`Grocery-List-${new Date().toISOString().slice(0, 10)}.pdf`);
    showSuccessToast('PDF downloaded');
  };

  const formatQty = (kg: number) => {
    const k = Math.floor(kg);
    const g = Math.round((kg - k) * 1000);
    return g > 0 ? `${k} kg ${g} g` : `${k} kg`;
  };

  return (
    <div className="grocery-list-panel">
      <div className="grocery-list-header">
        <div>
          <h2>🛒 Grocery List</h2>
          <p className="grocery-subtitle">Add vegetables & fruits, choose Organic or Non-organic, and export to PDF</p>
        </div>
        <div className="grocery-header-actions">
          <button
            type="button"
            className="grocery-btn grocery-btn-ghost"
            onClick={() => setLoadModal(true)}
            title="Load saved list"
          >
            <FaFolderOpen /> Load
          </button>
          <button
            type="button"
            className="grocery-btn grocery-btn-ghost"
            onClick={openSave}
            disabled={items.length === 0}
            title="Save list"
          >
            <FaSave /> Save
          </button>
          <button
            type="button"
            className="grocery-btn grocery-btn-ghost"
            onClick={exportPdf}
            disabled={items.length === 0}
            title="Export PDF"
          >
            <FaFilePdf /> PDF
          </button>
          <button
            type="button"
            className="grocery-btn grocery-btn-danger-ghost"
            onClick={clearList}
            disabled={items.length === 0}
            title="Clear list"
          >
            <FaTrash /> Clear
          </button>
        </div>
      </div>

      {/* Add block */}
      <div className="grocery-add-block">
        <div className="grocery-category-toggle">
          <span className="grocery-toggle-label">Add as:</span>
          <button
            type="button"
            className={`grocery-toggle-btn ${!addIsOrganic ? 'active' : ''}`}
            onClick={() => setAddIsOrganic(false)}
          >
            Non-organic
          </button>
          <button
            type="button"
            className={`grocery-toggle-btn organic ${addIsOrganic ? 'active' : ''}`}
            onClick={() => setAddIsOrganic(true)}
          >
            <FaLeaf /> Organic
          </button>
        </div>

        <div className="grocery-search-wrap">
          <input
            type="text"
            className="grocery-search-input"
            placeholder="Search vegetables & fruits..."
            value={searchQ}
            onChange={(e) => {
              setSearchQ(e.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
          />
          {searchQ.trim().length >= 2 && searchOpen && (
            <div className="grocery-search-dropdown">
              {searchFetching ? (
                <div className="grocery-search-loading">Searching...</div>
              ) : searchResults.length === 0 ? (
                <div className="grocery-search-empty">No products found</div>
              ) : (
                <ul className="grocery-search-list">
                  {searchResults.map((p) => (
                    <li
                      key={p.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        setSelectedProduct(p);
                        setSearchOpen(false);
                        setSearchQ('');
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && (setSelectedProduct(p), setSearchOpen(false), setSearchQ(''))}
                    >
                      {p.name} <span className="product-type-tag">{p.type}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {selectedProduct && (
          <div className="grocery-quantity-card">
            <span className="grocery-selected-name">
              {addIsOrganic && <FaLeaf className="organic-icon" />}
              {selectedProduct.name}
            </span>
            <div className="grocery-qty-inputs">
              <label>
                <span>Kg</span>
                <input
                  type="number"
                  min={0}
                  value={addKg}
                  placeholder="0"
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^\d*$/.test(val)) {
                      setAddKg(val);
                    }
                  }}
                  onBlur={() => {
                    if (addKg === '') return;
                    const normalized = String(Math.max(0, Number(addKg)));
                    setAddKg(normalized);
                  }}
                />
              </label>
              <label>
                <span>g</span>
                <input
                  type="number"
                  min={0}
                  max={999}
                  value={addG}
                  placeholder="0"
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^\d*$/.test(val)) {
                      setAddG(val);
                    }
                  }}
                  onBlur={() => {
                    if (addG === '') return;
                    const normalized = Math.min(999, Math.max(0, Number(addG)));
                    setAddG(String(normalized));
                  }}
                />
              </label>
            </div>
            <div className="grocery-qty-actions">
              <button
                type="button"
                className="grocery-btn grocery-btn-ghost"
                onClick={() => {
                  setSelectedProduct(null);
                  setAddKg('');
                  setAddG('');
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="grocery-btn grocery-btn-primary"
                onClick={addItem}
                disabled={quantityKg <= 0}
                title={quantityKg <= 0 ? 'Enter kg or g to add' : 'Add to list'}
              >
                <FaCartPlus /> Add to list
              </button>
            </div>
          </div>
        )}
      </div>

      {/* List */}
      {items.length === 0 ? (
        <EmptyState
          icon={<FaShoppingCart className="empty-state-icon-svg" aria-hidden />}
          title="Your list is empty"
          message="Search for vegetables or fruits above, choose quantity, and add them to build your grocery list. You can save and export to PDF when done."
        />
      ) : (
        <div className="grocery-list-section">
          <ul className="grocery-items-list">
            {items.map((i) => (
              <li key={i.localId} className="grocery-item-row">
                <div className="grocery-item-main">
                  <span className="grocery-item-name">
                    {i.isOrganic && <FaLeaf className="organic-leaf" title="Organic" />}
                    {i.productName}
                  </span>
                  <span className={`grocery-item-badge ${i.isOrganic ? 'organic' : 'non-organic'}`}>
                    {i.isOrganic ? 'Organic' : 'Non-organic'}
                  </span>
                  {i.isAnalysed && (
                    <span
                      className="grocery-item-analysed"
                      data-tooltip="Estimated from non-organic market data (+35% organic premium)"
                    >
                      Analysed
                      <span className="grocery-item-analysed-dot" aria-hidden="true">i</span>
                    </span>
                  )}
                </div>
                <div className="grocery-item-details">
                  <span>{formatQty(i.quantityKg)}</span>
                  <span>Rs. {i.pricePerKg.toFixed(2)}/kg</span>
                  <span className="grocery-item-total">Rs. {i.lineTotal.toFixed(2)}</span>
                </div>
                <button
                  type="button"
                  className="grocery-item-remove"
                  onClick={() => removeItem(i.localId)}
                  aria-label={`Remove ${i.productName}`}
                >
                  <FaTrash />
                </button>
              </li>
            ))}
          </ul>

          <div className="grocery-totals-card">
            {items.some((i) => i.isOrganic) && (
              <div className="grocery-total-row organic">
                <span>Organic subtotal</span>
                <span>Rs. {totals.organic.toFixed(2)}</span>
              </div>
            )}
            {items.some((i) => !i.isOrganic) && (
              <div className="grocery-total-row">
                <span>Non-organic subtotal</span>
                <span>Rs. {totals.nonOrganic.toFixed(2)}</span>
              </div>
            )}
            <div className="grocery-total-row grand">
              <span>Grand total</span>
              <span>Rs. {totals.grand.toFixed(2)}</span>
            </div>
            {totals.hasAnalysed && (
              <div className="grocery-total-note">
                Analysed items use non-organic market price + 35% organic premium.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Save modal */}
      {saveModal && (
        <div className="grocery-modal-overlay" onClick={() => setSaveModal(false)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Escape' && setSaveModal(false)}>
          <div className="grocery-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{loadedListId ? 'Update list' : 'Save list'}</h3>
            <input
              type="text"
              placeholder="List name"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              className="grocery-modal-input"
            />
            <div className="grocery-modal-actions">
              <button type="button" className="grocery-btn grocery-btn-ghost" onClick={() => setSaveModal(false)}>
                Cancel
              </button>
              <button type="button" className="grocery-btn grocery-btn-primary" onClick={doSave}>
                {loadedListId ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load modal */}
      {loadModal && (
        <div className="grocery-modal-overlay" onClick={() => setLoadModal(false)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Escape' && setLoadModal(false)}>
          <div className="grocery-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Load saved list</h3>
            {listsLoading ? (
              <LoadingSkeleton type="table" count={2} />
            ) : savedLists.length === 0 ? (
              <p className="grocery-no-lists">No saved lists yet. Save your current list to see it here.</p>
            ) : (
              <ul className="grocery-load-list">
                {savedLists.map((l) => (
                  <li key={l.id}>
                    <button type="button" className="grocery-load-item" onClick={() => loadList(l.id)}>
                      <span className="grocery-load-name">{l.name}</span>
                      <span className="grocery-load-meta">{l.itemCount} items · {new Date(l.createdAt).toLocaleDateString()}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="grocery-modal-actions">
              <button type="button" className="grocery-btn grocery-btn-ghost" onClick={() => setLoadModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close search */}
      {searchOpen && searchQ.trim().length >= 2 && (
        <div
          className="grocery-search-backdrop"
          aria-hidden
          onClick={() => setSearchOpen(false)}
        />
      )}
    </div>
  );
};

export default GroceryListPanel;
