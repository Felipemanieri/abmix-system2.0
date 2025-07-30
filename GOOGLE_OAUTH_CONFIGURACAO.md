# Configuração Google OAuth para abmixsystem.replit.app

## URLs AUTORIZADAS NO GOOGLE CLOUD CONSOLE

### Client ID Atual
`754195061143-fe16am2k6rvemnnm4gfe40j9ki3p70b0.apps.googleusercontent.com`

### URLs Autorizadas JavaScript
```
https://abmixsystem.replit.app
```

### URIs de Redirecionamento Autorizados
```
https://abmixsystem.replit.app/auth/google/callback
https://abmixsystem.replit.app/oauth/callback
https://abmixsystem.replit.app/google/callback
```

## PASSO A PASSO NO GOOGLE CLOUD CONSOLE

1. **Acesse:** https://console.cloud.google.com/apis/credentials
2. **Clique no Client ID:** `754195061143-fe16am2k6rvemnnm4gfe40j9ki3p70b0`
3. **Limpe todas as URLs antigas**
4. **Adicione apenas as URLs acima**
5. **Salve as alterações**

## VERIFICAÇÃO

Após configurar, teste:
1. Acesse: https://abmixsystem.replit.app
2. Teste qualquer integração Google (Sheets, Drive)
3. Confirme que não há erros de OAuth

## RESULTADO ESPERADO

- ✅ Google Sheets integração funciona
- ✅ Google Drive integração funciona
- ✅ Sem erros de redirect_uri_mismatch
- ✅ Sistema totalmente operacional

**Esta é a configuração definitiva do Google OAuth.**