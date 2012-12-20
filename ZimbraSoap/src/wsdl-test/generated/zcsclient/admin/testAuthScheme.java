
package generated.zcsclient.admin;

import javax.xml.bind.annotation.XmlEnum;
import javax.xml.bind.annotation.XmlEnumValue;
import javax.xml.bind.annotation.XmlType;


/**
 * <p>Java class for authScheme.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * <p>
 * <pre>
 * &lt;simpleType name="authScheme">
 *   &lt;restriction base="{http://www.w3.org/2001/XMLSchema}string">
 *     &lt;enumeration value="basic"/>
 *     &lt;enumeration value="form"/>
 *   &lt;/restriction>
 * &lt;/simpleType>
 * </pre>
 * 
 */
@XmlType(name = "authScheme")
@XmlEnum
public enum testAuthScheme {

    @XmlEnumValue("basic")
    BASIC("basic"),
    @XmlEnumValue("form")
    FORM("form");
    private final String value;

    testAuthScheme(String v) {
        value = v;
    }

    public String value() {
        return value;
    }

    public static testAuthScheme fromValue(String v) {
        for (testAuthScheme c: testAuthScheme.values()) {
            if (c.value.equals(v)) {
                return c;
            }
        }
        throw new IllegalArgumentException(v);
    }

}
