WITH VENDA_FILTRADA AS
(
  SELECT * FROM VENDA V
   WHERE ((INSTR(:CDFILIAL, V.CDFILIAL) <> 0)
       OR (:TCDFILIAL = 'T'))
  AND ((INSTR(:CDLOJA, V.CDFILIAL||V.CDLOJA) <> 0)
       OR (:TCDLOJA = 'T'))
  AND ((INSTR(:DTMOVTURCAIX, V.CDFILIAL||V.CDCAIXA||TO_CHAR(V.DTABERTUR, 'DD/MM/YYYY HH24:MI:SS')) > 0)
       OR (:TDTMOVTURCAIX = 'T'))
  AND ((INSTR(:CDVENDEDOR, NVL(V.CDVENDEDOR, V.CDVENDEDOR)) <> 0)
       OR (:TCDVENDEDOR = 'T'))
  AND (V.DTENTRVENDA BETWEEN :DATAINI AND :DATAFIN)
  AND V.IDSITUVENDA = 'O'
)
SELECT FI.CDFILIAL||' - '||FI.NMFILIAL AS LABELUNIDADE,
       FI.CDFILIAL,
       FI.NMFILIAL,
       LO.CDLOJA||' - '||LO.NMLOJA AS LABELLOJA,
       LO.CDLOJA,
       LO.NMLOJA,
       VD.CDVENDEDOR||'-'||VD.NMRAZSOCVEN AS LABELVENDEDOR,
       TO_CHAR(VE.DTENTRVENDA, 'DD/MM/YYYY') AS DTVENDA,
       TO_CHAR(VE.DTABERTUR, 'DD/MM/YYYY HH24:MI:SS') AS DTABERTUR,
       RP.VRREPIQUE,
       (CASE WHEN ((SUM(CASE WHEN ( IT.CDPRODUTO = NVL(LO.CDPRODTAXASERV, 'X')) THEN  NVL(IT.VRACRITVEND,0) ELSE 0 END)) > 0) THEN 
                    ((SUM(CASE WHEN ( IT.CDPRODUTO = NVL(LO.CDPRODTAXASERV, 'X')) THEN  NVL(IT.VRACRITVEND,0) ELSE 0 END))-RP.VRREPIQUE)
                         ELSE (SUM(CASE WHEN ( IT.CDPRODUTO = NVL(LO.CDPRODTAXASERV, 'X')) THEN  NVL(IT.VRACRITVEND,0) ELSE 0 END)) END ) AS VRGORJETA,
       SUM(CASE WHEN (IT.CDPRODUTO <> NVL(LO.CDPRODTAXAENTR,'X')) AND (IT.CDPRODUTO <> NVL(LO.CDPRODTAXASERV, 'X')) THEN  NVL(IT.VRDESITVEND,0) ELSE 0 END) AS DES,
NVL(( CASE WHEN ((SUM(CASE WHEN ( IT.CDPRODUTO = NVL(LO.CDPRODTAXASERV, 'X')) THEN  NVL(IT.VRACRITVEND,0) ELSE 0 END)) > 0) THEN (SUM(
         CASE WHEN (IT.CDPRODUTO <> NVL(LO.CDPRODTAXAENTR,'X')) AND (IT.CDPRODUTO <> NVL(LO.CDPRODTAXASERV, 'X')) THEN  
         TRUNC(IT.QTPRODVEND * (IT.VRUNITVEND + NVL(IT.VRUNITVENDCL, 0)), 2) - NVL(IT.VRDESITVEND, 0) + NVL(IT.VRACRITVEND, 0)
         ELSE 0 END
       )) + (SUM(CASE WHEN ( IT.CDPRODUTO = NVL(LO.CDPRODTAXASERV, 'X')) THEN  NVL(IT.VRACRITVEND,0) ELSE 0 END)) ELSE 
       (((SUM(
         CASE WHEN (IT.CDPRODUTO <> NVL(LO.CDPRODTAXAENTR,'X')) AND (IT.CDPRODUTO <> NVL(LO.CDPRODTAXASERV, 'X')) THEN  
         TRUNC(IT.QTPRODVEND * (IT.VRUNITVEND + NVL(IT.VRUNITVENDCL, 0)), 2) - NVL(IT.VRDESITVEND, 0) + NVL(IT.VRACRITVEND, 0)
         ELSE 0 END
       )) + RP.VRREPIQUE)) END
       ),0) AS VALOR_TOTAL,
       SUM(CASE WHEN (IT.CDPRODUTO = LO.CDPRODTAXAENTR) THEN  NVL(IT.VRACRITVEND,0) ELSE 0 END ) AS VRTXENTREGA
FROM VENDA_FILTRADA VE
     JOIN ITEMVENDA IT ON IT.CDFILIAL = VE.CDFILIAL AND IT.CDCAIXA = VE.CDCAIXA AND VE.NRSEQVENDA = IT.NRSEQVENDA
     LEFT JOIN FILIAL FI ON FI.CDFILIAL = VE.CDFILIAL
     LEFT JOIN LOJA LO ON LO.CDLOJA = VE.CDLOJA AND LO.CDFILIAL = VE.CDFILIAL
     INNER JOIN PRODUTO PR ON PR.CDPRODUTO = IT.CDPRODUTO
     LEFT JOIN VENDEDOR VD ON VE.CDVENDEDOR = VD.CDVENDEDOR
     LEFT JOIN (SELECT CDFILIAL, DTABERTUR, SUM(VRREPIQUEVENDA) VRREPIQUE FROM VENDA_FILTRADA GROUP BY CDFILIAL, DTABERTUR ) RP ON RP.CDFILIAL = VE.CDFILIAL AND RP.DTABERTUR = VE.DTABERTUR
GROUP BY FI.CDFILIAL,
         FI.NMFILIAL,
         LO.CDLOJA,
         LO.NMLOJA,
         VD.CDVENDEDOR,
         VD.NMRAZSOCVEN,
         VE.DTENTRVENDA,
         VE.DTABERTUR,
         RP.VRREPIQUE
ORDER BY FI.CDFILIAL,
         FI.NMFILIAL,
         LO.CDLOJA,
         LO.NMLOJA,
         VE.DTENTRVENDA,
         VE.DTABERTUR
