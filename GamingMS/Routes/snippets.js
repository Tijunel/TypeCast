const snippets = [
`getIndentOf = (word) => {
    let indent = 0;
    for (let ch of word) {
        if (ch === '\\n')
            indent = 0;
        else if (ch === ' ')
            indent++;
        else break;
    }
    return indent;
}`,
`bool isPalindrome (string str) {
    int i;
    int length = str.length();
    for (i = 0; i < length; ++i)
        if (str.at(i) != str.at(length - i - 1)) return false;
    return true;
}`,
`int factorial(int n) {
    if(n > 1)
        return n * factorial(n - 1);
    else
        return 1;
}`,
`int add(int n) {
    if(n != 0)
        return n + add(n - 1);
    return 0;
}`,
`int convertBinarytoOctal(long long binaryNumber) {
    int octalNumber = 0, decimalNumber = 0, i = 0;
    while(binaryNumber != 0) {
        decimalNumber += (binaryNumber%10) * pow(2,i);
        ++i;
        binaryNumber/=10;
    }
    i = 1;
    while (decimalNumber != 0) {
        octalNumber += (decimalNumber % 8) * i;
        decimalNumber /= 8;
        i *= 10;
    }
    return octalNumber;
}`,
`int hcf(int n1, int n2) {
    if (n2 != 0)
        return hcf(n2, n1 % n2);
    else 
        return n1;
}`,
`bool checkPrime(int n) {
    int i;
    bool isPrime = true;
    if (n == 0 || n == 1) {
        isPrime = false;
    }
    else {
        for(i = 2; i <= n/2; ++i) {
            if(n % i == 0) {
                isPrime = false;
                break;
            }
        }
    }
    return isPrime;
}`,
`int octalToDecimal(int octalNumber) {
    int decimalNumber = 0, i = 0, rem;
    while (octalNumber != 0) {
        rem = octalNumber % 10;
        octalNumber /= 10;
        decimalNumber += rem * pow(8, i);
        ++i;
    }
    return decimalNumber;
}`
];

module.exports = [snippets];