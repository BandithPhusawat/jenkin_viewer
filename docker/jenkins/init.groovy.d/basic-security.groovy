#!groovy
import jenkins.model.*
import hudson.security.*
import jenkins.security.ApiTokenProperty
import jenkins.security.apitoken.ApiTokenStore

// รันหลัง JCasC โหลดเสร็จ — สร้าง API token แบบ fixed สำหรับ dashboard-bot
// เพื่อให้ dashboard เชื่อมต่อได้ทันที โดยไม่ต้อง manual generate

Thread.start {
    sleep(5000) // รอ JCasC โหลด user เสร็จ

    def instance = Jenkins.getInstance()
    def user = hudson.model.User.getById('dashboard-bot', false)

    if (user != null) {
        def apiTokenProperty = user.getProperty(ApiTokenProperty.class)
        if (apiTokenProperty != null) {
            def tokenStore = apiTokenProperty.getTokenStore()
            // ลบ token เก่า ถ้ามี
            tokenStore.getTokenListSortedByName().each { token ->
                tokenStore.revokeToken(token.getUuid())
            }
            // สร้าง token ใหม่
            def result = tokenStore.generateNewToken("dashboard-token")
            println "===================================================="
            println "DASHBOARD API TOKEN: ${result.plainValue}"
            println "===================================================="
            user.save()
        }
    }
}
